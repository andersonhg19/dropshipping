import React from 'react'

import { SxProps, TextField, TextFieldProps, Theme } from '@mui/material'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

interface CustomEditTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  label: string
  value: unknown
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  name: string
  error?: boolean
  helperText?: React.ReactNode
  sx?: SxProps<Theme>
  autocomplete?: string
  disabled?: boolean
}

const CustomEditTextField: React.FC<CustomEditTextFieldProps> = ({
  label,
  value,
  onChange,
  name,
  error = false,
  helperText = '',
  sx = {},
  autocomplete = 'off',
  disabled = false,
  ...props
}) => {
  const palette = usePaletteVars()

  return (
    <TextField
      label={label}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      error={error}
      helperText={helperText}
      fullWidth
      autoComplete={autocomplete}
      variant="outlined"
      disabled={disabled}
      InputLabelProps={{
        shrink: true,
        style: {
          color: palette.textSecondaryColor,
          fontWeight: 500,
        },
      }}
      sx={{
        // Fondo y borde del input inspirado en Uiverse
        background: palette.inputBgColor,
        borderRadius: '10px',
        boxShadow: '0px 10px 10px -5px #cff0ff',
        marginTop: '15px',
        paddingLeft: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          background: palette.inputBgColor, // Usar color del tema, no 'white'
          paddingRight: 0,
          paddingLeft: 0,
          boxShadow: 'none',
          border: 'none',
          '& fieldset': {
            border: `2px solid ${palette.inputBorderColor}`,
            borderInline: `2px solid ${palette.inputBorderColor}`,
            borderRadius: '10px',
            transition: 'border-inline-color 0.2s',
          },
          '&:hover fieldset': {
            borderInline: `2px solid ${palette.buttonBgColor}`,
          },
          '&.Mui-focused fieldset': {
            borderInline: `2px solid ${palette.buttonBgColor}`,
          },
          '& input': {
            padding: '15px 20px',
            color: palette.textColor, // SIEMPRE contraste
            textAlign: 'start',
            background: 'transparent', // o palette.inputBgColor
          },
        },
        '& .MuiInputLabel-root': {
          color: palette.textSecondaryColor,
          left: 15,
          top: 0,
          background: 'transparent',
        },
        ...(error && {
          '& .MuiOutlinedInput-root fieldset': {
            borderColor: (theme) => theme.palette.error.main,
            borderInline: (theme) => `2px solid ${theme.palette.error.main}`,
          },
          '& .MuiInputLabel-root': {
            color: (theme) => theme.palette.error.main,
          },
        }),
        ...sx,
      }}
      {...props}
    />
  )
}

export default CustomEditTextField
