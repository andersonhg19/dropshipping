'use client'

import { Theme, createTheme } from '@mui/material/styles'
import getMPTheme from 'src/theme/get-MP-theme'

const lightTheme = createTheme(getMPTheme('light'))
const darkTheme = createTheme(getMPTheme('dark'))

interface ThemeOptions {
  light: Theme
  dark: Theme
}

const theme: ThemeOptions = {
  light: lightTheme,
  dark: darkTheme,
}

export default theme
