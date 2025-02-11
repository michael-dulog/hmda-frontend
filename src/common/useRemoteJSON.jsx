import { useEffect, useState } from 'react'
import hasHttpError from '../filing/actions/hasHttpError'

/**
 * Custom hook to reuse logic for fetching remote JSON data
 * @param {String}   sourceUrl
 * @param {Object}   options
 * @param {Function} options.transformReceive    Chance to modify the retrived JSON before it gets saved to Hook state: (data) => ()
 * @param {Object}   options.defaultData  Default JSON returned from URL
 * @param {Boolean}  options.forceFetch   Default data is returned in Dev environments unless this flag is set to `true`
 * @param {String}   options.errorMsg     Customize error Message
 */
export function useRemoteJSON(sourceUrl, options = {}) {
  const [data, setData] = useState(options.defaultData)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState(null)

  const shouldFetch =
    options.forceFetch ||
    (process.env.REACT_APP_ENVIRONMENT !== 'CI' &&   // Not CI
      window.location.host.indexOf('localhost') < 0) // Not localhost

  useEffect(() => {
    if (!shouldFetch) return
    setIsFetching(true)
    setError(null)

    fetch(sourceUrl)
      .then((response) => {
        if (hasHttpError(response)) return Promise.reject(response)
        return response.json()
      })
      .then((json) => {
        if (options.transformReceive) setData(options.transformReceive(json))
        else setData(json)
        setIsFetching(false)
      })
      .catch((response) => {
        const { status, statusText } = response
        setIsFetching(false)
        setError(options.errorMsg || `Error: ${status} - ${statusText}`)
      })
    // eslint-disable-next-line
  }, [])

  return [data, isFetching, error]
}