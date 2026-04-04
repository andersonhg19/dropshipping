'use client'

import React from 'react'

import styles from '@components/atoms/custom-choice-selector/custom-choice-selector.module.css'

interface CustomChoiceSelectorProps {
  options: { value: string; label: string }[]
  onChoiceSelect: (value: string) => void
}

const CustomChoiceSelector: React.FC<CustomChoiceSelectorProps> = ({ options, onChoiceSelect }) => {
  const [selectedOption, setSelectedOption] = React.useState<string>('')

  const handleSelect = (value: string) => {
    setSelectedOption(value)
    onChoiceSelect(value)
  }

  return (
    <div className={styles.container}>
      {options.map((option) => (
        <div key={option.value} className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id={`checkbox_${option.value}`}
            className={styles.checkbox}
            checked={selectedOption === option.value}
            onChange={() => handleSelect(option.value)}
          />
          <label htmlFor={`checkbox_${option.value}`} className={styles.checkboxLabel}>
            <div id="tick_mark" className={styles.tickMark}></div>
          </label>
          <span className={styles.optionLabel}>{option.label}</span>
        </div>
      ))}
    </div>
  )
}

export default CustomChoiceSelector
