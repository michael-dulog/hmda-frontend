import React from 'react'
import './TextSelector.css'

const TextSelector = ({ selected, options, onChange, label, className }) => {
  if(!options) return null

  const _clickHandler = (e) => {
    e.preventDefault()
    onChange(e.target.text)
  }

  const getActiveClass = (current, selected) => {
    const selectedValue = (typeof selected === 'string') ? selected.toLowerCase() : selected.value
    return current.toLowerCase() === selectedValue ? 'active' : ''
  }


  return (
    <div className={'TextSelector' + (className ? ` ${className}` : '')}>
      {label && <h4 className='label'>{label}</h4>}
      <div className="options">
        {options.map((current, i) => {
          console.log(current, 'is active', getActiveClass(current, selected))
          return (
            <a
              className={'option ' + getActiveClass(current, selected)}
              onClick={_clickHandler}
              key={i}
            >
              {current}
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default TextSelector