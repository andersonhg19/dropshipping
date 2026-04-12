'use client'

import React from 'react'

import { TextField } from '@mui/material'

interface InputProps {
  type: string
  name?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void // 👈
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void // 👈
  autocomplete?: string
  disabled?: boolean
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

const Input: React.FC<InputProps> = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  onKeyDown,
  onFocus, // 👈
  onBlur, // 👈
  autocomplete,
  disabled,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}) => {
  return (
    <TextField
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      onFocus={onFocus} // 👈
      onBlur={onBlur} // 👈
      autoComplete={autocomplete}
      fullWidth
      variant="outlined"
      disabled={disabled}
      className={className}
      style={style}
      inputProps={{
        'aria-label': ariaLabel,
        'aria-invalid': ariaInvalid,
        'aria-describedby': ariaDescribedby,
      }}
    />
  )
}

export default Input
