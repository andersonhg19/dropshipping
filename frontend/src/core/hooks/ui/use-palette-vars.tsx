import { useTheme as useMuiTheme } from '@mui/material/styles'
import { FILIAL_LIGHT_TEMPLATE_SEED_VALUES } from '@core/constants/palette-default-values'
import type { PaletteVarName } from '@core/constants/palette-var-names'
import { brand, gray, purple } from 'src/theme/colors'

import { useFilialStyleOverrides } from '@hooks/context/filial-style-context'

export type PaletteVars = {
  bgGradient: string
  textColor: string
  textSecondaryColor: string
  buttonBgColor: string
  buttonBgColorSecondary: string
  buttonTextColor: string
  secondaryButtonTextColor: string
  secondaryButtonBorderColor: string
  iconColor: string
  overlayGradient: string
  appBarBg: string
  appBarShadow: string

  cardBgColor: string
  cardBorderColor: string

  inputBgColor: string
  inputBorderColor: string

  dataGridHeaderBg: string
  dataGridHeaderTextColor: string
  dataGridRowBg: string
  dataGridRowHoverBg: string
  dataGridSelectedBg: string
  dataGridTextColor: string

  chartCartesianGrid: string
  chartLinePrimaryColor: string
  chartLineSecundaryColor: string
  chartBarPrimaryColor?: string
  chartBarSecundaryColor?: string
  chartBarTertiaryColor?: string
  chartPiePrimaryColor?: string
  chartPieSecundaryColor?: string
  chartPieTertiaryColor?: string
  chartPieQuaternaryColor?: string
  chartPieQuinaryColor?: string
  chartPieSenaryColor?: string
}

/** Valores por defecto según theme (sin overrides de subsidiaria). */
function getDefaultPaletteVars(theme: ReturnType<typeof useMuiTheme>, mode: 'light' | 'dark'): PaletteVars {
  return {
    // Gradiente de fondo principal con brand
    bgGradient:
      mode === 'dark'
        ? `linear-gradient(to right, ${brand[800]}, ${brand[900]}, ${brand[600]})`
        : `linear-gradient(to right, ${brand[100]}, ${brand[50]}, ${brand[200]})`,

    textColor: mode === 'dark' ? brand[50] : brand[400],
    textSecondaryColor: mode === 'dark' ? brand[200] : brand[700],

    buttonBgColor: theme.palette.primary.main, // brand[400]
    buttonBgColorSecondary: brand[200], // Para botones secundarios
    buttonTextColor: theme.palette.primary.contrastText, // #fff o brand[50]
    secondaryButtonTextColor: brand[700],
    secondaryButtonBorderColor: brand[200],

    iconColor: mode === 'dark' ? brand[100] : brand[400],

    // Gradiente decorativo para overlays y hovers
    overlayGradient:
      mode === 'dark'
        ? `linear-gradient(135deg, ${brand[800]} 40%, ${brand[400]} 100%)`
        : `linear-gradient(135deg, ${brand[100]} 40%, ${brand[200]} 100%)`,

    // AppBar principal y sombra (fondo azul claro en light para que iconos y texto sean visibles)
    appBarBg: mode === 'dark' ? brand[900] : brand[100],
    appBarShadow: mode === 'dark' ? `0 4px 16px ${brand[800]}80` : `0 4px 16px ${brand[100]}40`,

    // Card y formularios
    cardBgColor: mode === 'dark' ? brand[800] : brand[50],
    cardBorderColor: mode === 'dark' ? brand[900] : brand[100],

    // Inputs
    inputBgColor: mode === 'dark' ? brand[900] : brand[0],
    inputBorderColor: mode === 'dark' ? brand[600] : brand[200],

    // DataGrid
    dataGridHeaderBg: mode === 'dark' ? brand[900] : brand[600],
    dataGridHeaderTextColor: mode === 'dark' ? brand[50] : brand[50],
    dataGridRowBg: mode === 'dark' ? brand[800] : brand[50],
    dataGridRowHoverBg: mode === 'dark' ? brand[700] : brand[100],
    dataGridSelectedBg: mode === 'dark' ? brand[600] : brand[200],
    dataGridTextColor: mode === 'dark' ? brand[50] : brand[400],

    chartCartesianGrid: mode === 'dark' ? gray[100] : brand[0],
    chartLinePrimaryColor: mode === 'dark' ? brand[100] : brand[200],
    chartLineSecundaryColor: mode === 'dark' ? brand[300] : brand[400],
    chartBarPrimaryColor: mode === 'dark' ? brand[200] : brand[300],
    chartBarSecundaryColor: mode === 'dark' ? brand[400] : brand[200],
    chartBarTertiaryColor: mode === 'dark' ? brand[900] : brand[400],
    chartPiePrimaryColor: mode === 'dark' ? brand[200] : brand[200],
    chartPieSecundaryColor: mode === 'dark' ? brand[400] : brand[300],
    chartPieTertiaryColor: mode === 'dark' ? brand[900] : brand[500],
    chartPieQuaternaryColor: mode === 'dark' ? purple[600] : purple[400],
    chartPieQuinaryColor: mode === 'dark' ? purple[700] : purple[500],
    chartPieSenaryColor: mode === 'dark' ? purple[800] : purple[600],
  }
}

export const usePaletteVars = (): PaletteVars => {
  const theme = useMuiTheme()
  const mode = theme.palette.mode
  const overrides = useFilialStyleOverrides()

  const defaults = getDefaultPaletteVars(theme, mode)

  if (Object.keys(overrides).length === 0) {
    return defaults
  }

  const result = { ...defaults }
  for (const key of Object.keys(overrides) as (keyof PaletteVars)[]) {
    if (!(key in result) || !overrides[key]) continue

    // Plantilla "tema claro" de filial: mismos valores que PALETTE_DEFAULT_VALUES.
    // En modo oscuro no deben pisar los defaults oscuros (texto/cards quedan ilegibles).
    if (mode === 'dark') {
      const lightSeed = FILIAL_LIGHT_TEMPLATE_SEED_VALUES.get(key as PaletteVarName)
      if (lightSeed !== undefined && overrides[key] === lightSeed) {
        continue
      }
    }

    ;(result as Record<string, string>)[key] = overrides[key]!
  }
  return result
}
