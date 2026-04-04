import React from 'react'

import Grid from '@mui/material/Grid'

import styles from '@components/atoms/custom-input/custom-input.module.css'

interface CustomInputProps {
  label: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  autoComplete?: string
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  autoComplete,
}) => {
  return (
    <Grid className={styles.formControl}>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={styles.input}
      />
      <label className={styles.label}>
        {label.split('').map((char, index) => (
          <span key={index} className={styles.labelSpan} style={{ transitionDelay: `${index * 50}ms` }}>
            {char}
          </span>
        ))}
      </label>
    </Grid>
  )
}

export default CustomInput
