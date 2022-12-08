import React from 'react'
import { useDispatch } from 'react-redux'
import { applyFilter } from '../parsedHelpers'
import { selectCol } from '../data-store/store'
import {
  columnIsSelected,
  formatColWidth,
  formatFieldID,
  getUsableProps
} from './service'

export const buildColumns = ({
  rows,
  matchedColumns,
  columnFilter,
  searchFilter,
  targetSchema,
  selectedColName,
}) => {
  if (!rows.length) return null

  const relevantColumns = filterFields({
    matchedColumns,
    targetSchema,
    columnFilter,
  })

  return relevantColumns.map(f => ({
    key: f.fieldName,
    header: f.fieldName,
    width: 'auto',
    header: props => (
      <ColumnHeader
        field={f}
        selectedColName={selectedColName}
        {...props}
      />
    ),
    content: ({ row, ...props }) => (
      <ColumnContent
        row={row}
        field={f}
        searchFilter={searchFilter}
        selectedColName={selectedColName}
        {...props}
      />
    ),
  }))
}

const ColumnHeader = ({ field, selectedColName, ...props }) => {
  const dispatch = useDispatch()
  const fieldID = formatFieldID(field)
  const usableProps = getUsableProps(props)
  const wrapperClasses = ['clickable', 'header-cell', 'custom']
  const fieldName = field.fieldName

  if (columnIsSelected(selectedColName, field)) wrapperClasses.push('selected')

  const clickHandler = () => {
    dispatch(selectCol(fieldName))
    document
      .getElementById(fieldID)
      .scrollIntoView({ inline: 'center', block: 'start' })
  }

  return (
    <div
      id={fieldID}
      className={wrapperClasses.join(' ')}
      {...usableProps}
      style={{ width: formatColWidth(field) }}
      onClick={clickHandler}
    >
      <div className={'custom-cell-content header-cell-text'}>{fieldName}</div>
    </div>
  )
}

const ColumnContent = ({ row, field, searchFilter, selectedColName, ...props }) => {
  const dispatch = useDispatch()
  const fieldName = field.fieldName
  let fieldValue = row[fieldName] || '-'

  const styles = { width: formatColWidth(field, -16) }
  const wrapperClasses = ['custom-cell-content']
  const clickHandler = () => dispatch(selectCol(fieldName))
  
  if (columnIsSelected(selectedColName, field))
    wrapperClasses.push('col-selected')

  const isMatchForSearch =
    searchFilter.length &&
    row[fieldName]
      ?.toString()
      .toLowerCase()
      .includes(searchFilter.toLowerCase())

  if (isMatchForSearch) {
    wrapperClasses.push('highlight-match')
    fieldValue = row[fieldName]
  }

  return (
    <div
      className={wrapperClasses.join(' ')}
      onClick={clickHandler}
      style={styles}
      id={`row-${row.rowId}`}
    >
      {fieldValue}
    </div>
  )
}

const filterFields = ({ matchedColumns, targetSchema, columnFilter }) =>
  targetSchema
    .filter(x =>
      !matchedColumns.length ? true : matchedColumns.includes(x.fieldName)
    )
    .filter(x => applyFilter(x, columnFilter.toLowerCase()))
