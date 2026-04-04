/**
 * Lista de tokens válidos que pueden ser configurados desde Estilos de Subsidiaria.
 * Debe coincidir con las claves del tipo PaletteVars en use-palette-vars.
 */
export const PALETTE_VAR_NAMES = [
  'bgGradient',
  'textColor',
  'textSecondaryColor',
  'buttonBgColor',
  'buttonBgColorSecondary',
  'buttonTextColor',
  'secondaryButtonTextColor',
  'secondaryButtonBorderColor',
  'iconColor',
  'overlayGradient',
  'appBarBg',
  'appBarShadow',
  'cardBgColor',
  'cardBorderColor',
  'inputBgColor',
  'inputBorderColor',
  'dataGridHeaderBg',
  'dataGridHeaderTextColor',
  'dataGridRowBg',
  'dataGridRowHoverBg',
  'dataGridSelectedBg',
  'dataGridTextColor',
  'chartCartesianGrid',
  'chartLinePrimaryColor',
  'chartLineSecundaryColor',
  'chartBarPrimaryColor',
  'chartBarSecundaryColor',
  'chartBarTertiaryColor',
  'chartPiePrimaryColor',
  'chartPieSecundaryColor',
  'chartPieTertiaryColor',
  'chartPieQuaternaryColor',
  'chartPieQuinaryColor',
  'chartPieSenaryColor',
] as const

export type PaletteVarName = (typeof PALETTE_VAR_NAMES)[number]

/** Comprueba si un string es un token válido de PaletteVars */
export function isValidPaletteVarName(name: string): boolean {
  return (PALETTE_VAR_NAMES as readonly string[]).includes(name)
}
