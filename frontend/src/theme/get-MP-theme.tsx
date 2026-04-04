import { PaletteMode, ThemeOptions } from '@mui/material/styles'
import type {} from '@mui/material/themeCssVarsAugmentation'

import {
  dataDisplayCustomizations,
  feedbackCustomizations,
  inputsCustomizations,
  navigationCustomizations,
} from './customizations'
import { getDesignTokens } from './theme-primitives'

export default function getMPTheme(mode: PaletteMode): ThemeOptions {
  return {
    ...getDesignTokens(mode),
    components: {
      ...inputsCustomizations,
      ...dataDisplayCustomizations,
      ...feedbackCustomizations,
      ...navigationCustomizations,
    },
  }
}
