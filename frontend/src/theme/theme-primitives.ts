import { PaletteMode } from '@mui/material'
import { Shadows, alpha, createTheme } from '@mui/material/styles'
import { Inter } from 'next/font/google'

import { brand, gray, green, orange, red } from './colors'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

const defaultTheme = createTheme()
const customShadows: Shadows = [...defaultTheme.shadows]

export const getDesignTokens = (mode: PaletteMode) => {
  customShadows[1] =
    mode === 'dark'
      ? 'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px'
      : 'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px'

  customShadows[4] = '0px 5px 15px rgba(9, 11, 17, 0.05), 0px 15px 35px -5px rgba(19, 23, 32, 0.05)'

  return {
    palette: {
      mode,
      // Brand como color primario global (botones, appbar, tabs, etc)
      primary: {
        ...brand,
        main: brand[400],
        light: brand[200],
        dark: brand[600],
        contrastText: mode === 'dark' ? brand[50] : '#fff',
      },
      // info, para elementos secundarios de información (puedes usar otro tono de brand)
      info: {
        ...brand,
        main: brand[200], // un poco más claro que el primary
        light: brand[100],
        dark: brand[400],
        contrastText: mode === 'dark' ? brand[900] : brand[400],
      },
      // Sólo para feedback
      warning: {
        ...orange,
        main: orange[400],
        contrastText: mode === 'dark' ? orange[50] : orange[900],
      },
      error: {
        ...red,
        main: red[400],
        contrastText: mode === 'dark' ? red[100] : red[900],
      },
      success: {
        ...green,
        main: green[400],
        contrastText: mode === 'dark' ? green[50] : green[900],
      },
      // Grises solo para backgrounds y bordes secundarios
      grey: { ...gray },
      divider: mode === 'dark' ? alpha(brand[800], 0.7) : alpha(brand[100], 0.4),
      background: {
        default: mode === 'dark' ? brand[900] : brand[50], // ¡BRAND en vez de gray!
        paper: mode === 'dark' ? brand[800] : brand[100], // ¡BRAND!
      },
      text: {
        primary: mode === 'dark' ? brand[50] : brand[400], // Textos principales
        secondary: mode === 'dark' ? brand[200] : brand[700], // Textos secundarios (oscuro: claro, claro: oscuro)
        warning: orange[400],
      },
      action: {
        hover: mode === 'dark' ? alpha(brand[600], 0.2) : alpha(brand[200], 0.13),
        selected: mode === 'dark' ? alpha(brand[600], 0.3) : alpha(brand[200], 0.27),
        active: mode === 'dark' ? brand[100] : brand[400],
        disabled: alpha(brand[400], 0.4),
        disabledBackground: alpha(brand[400], 0.09),
      },
    },
    typography: {
      fontFamily: inter.style.fontFamily,
      // Puedes agregar estilos custom aquí si quieres headings con color brand[400]
    },
    shape: {
      borderRadius: 5,
    },
    shadows: customShadows,
  }
}
