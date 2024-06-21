import { splitYearQuarter } from '../../filing/api/utils'
import { isBeta } from '../configUtils'

const defaultOpts = {
  withAdmin: true // Include administrative years (PREVIEW) in the returned list
}

// Filing Periods accessible to HMDA Filers
export const getFilingPeriods = config => {
  if (!config) return []

  const periods = Object.values(config.filingPeriodStatus)
    .filter(({ isVisible }) => isVisible)
    .map(({ period }) => period)

  const unique = Array.from(new Set(periods))

  return unique
}

/**
 * Reachable Annual Filing Years
 * @param {Object} config Environment configuration
 * @param {Object} options See defaultOps for all options
 */
export const getFilingYears = (config, options = defaultOpts) => {
  const { withAdmin } = options
  const years = new Set()
  const filingPeriodStatus = config.filingPeriodStatus || {}

  // Collect all HMDA Filer accessible years
  Object.values(filingPeriodStatus).forEach(status => {
    const { period, isVisible } = status || {}
    isVisible && years.add(splitYearQuarter(period)[0])
  })

  // Additions for HMDA Help users
  if (withAdmin) {
    config.timedGuards.preview.forEach(adminPeriod =>
      years.add(splitYearQuarter(adminPeriod)[0])
    )

    const [year, quarter] = splitYearQuarter(config.defaultPeriod)

    if (isBeta()) {
      // Always allow access to *next* year in Beta environments
      const upcomingYear = new Date().getFullYear() + 1
      years.add(upcomingYear.toString())
    } else if (year) {
      // Starting in Q3, automatically enable institution management for the upcoming year
      const upcomingYear = quarter !== 'Q3' ? year : parseInt(year, 10) + 1
      years.add(upcomingYear.toString())
    }
  }

  return Array.from(years)
    .map(x => parseInt(x, 10))
    .sort()
    .reverse()
    .map(x => x.toString())
}

/**
 * Returns the years for which Filing is open
 * @param {Object} config Environment configuration
 */
export const getOpenFilingYears = (config) => {
  const candidates = getFilingYears(config, ({ withAdmin: false }))
  const { filingPeriodStatus } = config

  return candidates.filter(period => {
    const { isOpen, isLate } = filingPeriodStatus[period]
    return isOpen || isLate
  })
}

/**
 * Sorts the Filing years
 * @param {Array} years contains the filing years and quarters
 */
export const sortFilingYears = (years) =>  {
  function getYear(year) {
    // y = year, q = quarter
    const [y, q] = year.split("-")

    if (q) {
      return [parseInt(y), parseInt(q.slice(1))]
    } else {
      return parseInt(y)
    }
  }

  years.sort((a, b) => {
    const aYear = getYear(a)
    const bYear = getYear(b)

    if (aYear[0] === bYear[0]) {
      return aYear[1] - bYear[1]
    } else {
      return aYear[0] - bYear[0]
    }
  })
  return years
}