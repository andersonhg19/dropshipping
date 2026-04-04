// components/RadioInput.tsx
// Importa Grid2 de Material UI
import React from 'react'

import { SxProps, Theme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { StyleAtom } from '@states/style-atom'
import { useAtom } from 'jotai'

import styles from '@components/atoms/radio-input/custom-radio-input.module.css'

interface RadioInputProps {
  bgColor?: string
  checkedBgColor?: string
  selectedOption: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
  sx?: SxProps<Theme>
}

const RadioInput: React.FC<RadioInputProps> = ({
  bgColor,
  checkedBgColor,
  sx,
  selectedOption,
  onChange,
  options,
  disabled,
}) => {
  const [stylesAtom] = useAtom(StyleAtom)

  const handleOptionChange = (value: string) => {
    onChange(value)
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      className={styles.radioInputs}
      sx={{
        backgroundColor: stylesAtom.backgroundColorHeader || bgColor || '#e8e8e8',
        borderRadius: '10px',
        padding: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '100%',
        ...sx,
      }}
    >
      {options.map((option) => (
        <label key={option.value} className={styles.radio}>
          <input
            type="radio"
            name="radio"
            value={option.value}
            checked={selectedOption === option.value}
            onChange={() => handleOptionChange(option.value)}
            disabled={disabled}
          />
          <span
            className={styles.name}
            style={{
              backgroundColor: selectedOption === option.value ? checkedBgColor || '#ccc' : 'transparent',
              boxShadow:
                selectedOption === option.value
                  ? 'inset 0 4px 6px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)',
              padding: '10px 20px',
              width: '100%',
              display: 'inline-block',
              textAlign: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {option.label}
          </span>
        </label>
      ))}
    </Grid>
  )
}

export default RadioInput
