import React from 'react'

import { FormControl, FormHelperText, InputLabel, Select, SelectChangeEvent, SxProps, Theme } from '@mui/material'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

interface CustomEditSelectFormControlProps {
  label: string
  name: string
  value: unknown
  onChange: (event: SelectChangeEvent<unknown>) => void
  children: React.ReactNode
  error?: boolean
  helperText?: string
  sx?: SxProps<Theme>
  disabled?: boolean
}

const CustomEditSelectFormControl: React.FC<CustomEditSelectFormControlProps> = ({
  label,
  name,
  value,
  onChange,
  children,
  error = false,
  helperText = '',
  sx = {},
  disabled = false,
}) => {
  const palette = usePaletteVars()

  return (
    <FormControl
      fullWidth
      variant="outlined"
      error={error}
      sx={{
        background: palette.inputBgColor,
        borderRadius: '10px',
        marginTop: '15px',
        boxShadow: '0px 10px 10px -5px #cff0ff',
        border: 'none',
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          background: palette.inputBgColor,
          border: 'none',
          boxShadow: 'none',
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
        },
        '& .MuiInputLabel-root': {
          color: palette.textSecondaryColor,
          left: 15,
          top: 0,
        },
        ...(error && {
          '& .MuiOutlinedInput-root fieldset': {
            borderColor: (theme: Theme) => theme.palette.error.main,
            borderInline: (theme: Theme) => `2px solid ${theme.palette.error.main}`,
          },
          '& .MuiInputLabel-root': {
            color: (theme: Theme) => theme.palette.error.main,
          },
        }),
        ...sx,
      }}
    >
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value === undefined || value === null ? '' : value}
        onChange={onChange}
        notched
        disabled={disabled}
        sx={{
          color: palette.textColor,
          textAlign: 'center',
          '& .MuiSelect-select': {
            padding: '8px 5px',
            borderRadius: '10px',
            color: palette.textColor,
            textAlign: 'center',
            background: palette.inputBgColor,
          },
        }}
        MenuProps={{
          PaperProps: {
            style: { borderRadius: 10 },
          },
        }}
      >
        {children}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default CustomEditSelectFormControl
