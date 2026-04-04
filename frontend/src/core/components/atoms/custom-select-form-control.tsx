import React from 'react'

import { FormControl, InputLabel, InputLabelProps, Select, SelectProps, SxProps, Theme, useTheme } from '@mui/material'

interface CustomSelectFormControlProps {
  label: string
  name: string
  value: unknown
  onChange: SelectProps['onChange']
  children: React.ReactNode
  labelColor?: string
  inputBgColor?: string
  inputBorderColor?: string
  textColor?: string
  borderDark?: boolean // Solo activa borde oscuro en modo claro
  labelProps?: InputLabelProps
  selectProps?: Partial<SelectProps>
  sx?: SxProps<Theme>
  formControlProps?: React.ComponentProps<typeof FormControl>
}
const CustomSelectFormControl: React.FC<CustomSelectFormControlProps> = ({
  label,
  name,
  value,
  onChange,
  children,
  labelColor = '#555',
  inputBgColor = '#fff',
  inputBorderColor = '#bbb',
  textColor = '#222',
  borderDark = false,
  labelProps = {},
  selectProps = {},
  sx = {},
  formControlProps = {},
}) => {
  const muiTheme = useTheme()
  // Si el tema es claro y borderDark es true, activa el borde oscuro
  const showDarkBorder = borderDark && muiTheme.palette.mode === 'light'

  return (
    <FormControl
      fullWidth
      variant="outlined"
      sx={{
        background: inputBgColor,
        borderRadius: 2,
        ...sx,
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
        '& .MuiInputLabel-root': { color: labelColor },
      }}
      {...formControlProps}
    >
      <InputLabel {...labelProps} style={{ color: labelColor }}>
        {label}
      </InputLabel>
      <Select
        displayEmpty
        name={name}
        label={label}
        value={value === undefined || value === null ? '' : value}
        onChange={onChange}
        sx={{ color: textColor }}
        {...selectProps}
      >
        {children}
      </Select>
    </FormControl>
  )
}

export default CustomSelectFormControl
