import React from 'react'

import { SxProps, TextField, TextFieldProps, Theme } from '@mui/material'
import { useTheme } from '@mui/material/styles'

interface CustomTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  label: string
  value: unknown
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  name: string
  error?: boolean
  helperText?: React.ReactNode
  inputBgColor?: string
  inputBorderColor?: string
  textColor?: string
  labelColor?: string
  sx?: SxProps<Theme>
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  label,
  value,
  onChange,
  name,
  error = false,
  helperText = '',
  inputBgColor = '#fff',
  inputBorderColor = '#bbb',
  textColor = '#222',
  labelColor = '#555',
  sx = {},
  ...props
}) => {
  const muiTheme = useTheme()
  const showDarkBorder = muiTheme.palette.mode === 'light'

  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      fullWidth
      autoComplete="off"
      variant="outlined"
      sx={{
        background: inputBgColor,
        borderRadius: muiTheme.shape.borderRadius,
        '& .MuiOutlinedInput-root': {
          color: textColor,
          background: inputBgColor,
        },
        '& .MuiOutlinedInput-notchedOutline': showDarkBorder
          ? {
              borderColor: '#222 !important',
              borderWidth: '2px !important',
            }
          : {
              borderColor: `${inputBorderColor} !important`,
              borderWidth: '1px !important',
            },
        // Para el label
        '& .MuiInputLabel-root': {
          color: labelColor,
          // Default style para todos los estados
        },
        // Cuando el campo NO está shrink (vacío y no enfocado)
        '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
          top: '-2px',
          transform: 'translate(16px, 10px) scale(1)',
        },
        // Cuando el label está shrink (tiene valor o está enfocado)
        '& .MuiInputLabel-root.MuiInputLabel-shrink': {
          // Deja a MUI controlar el floating label (no sobrescribir aquí)
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: labelColor,
        },
        // Color del label cuando hay error
        ...(error && {
          '& .MuiInputLabel-root': { color: muiTheme.palette.error.main },
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: muiTheme.palette.error.main },
          },
        }),
        ...sx,
      }}
      {...props}
    />
  )
}

export default CustomTextField
