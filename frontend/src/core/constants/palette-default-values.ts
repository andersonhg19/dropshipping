import { brand, gray, purple } from 'src/theme/colors'

import type { PaletteVarName } from './palette-var-names'

export interface PaletteTokenInfo {
  name: PaletteVarName
  value: string
  description: string
}

/**
 * Valores por defecto (tema light) para cada token.
 * Se usan como plantilla en "Agregar desde plantilla" (variante clara).
 */
export const PALETTE_DEFAULT_VALUES: PaletteTokenInfo[] = [
  { name: 'textColor', value: brand[400], description: 'Texto principal' },
  { name: 'textSecondaryColor', value: brand[700], description: 'Texto secundario, labels' },
  { name: 'buttonBgColor', value: brand[400], description: 'Fondo botones primarios' },
  { name: 'buttonTextColor', value: '#ffffff', description: 'Texto botones primarios' },
  { name: 'buttonBgColorSecondary', value: brand[200], description: 'Fondo botones secundarios' },
  { name: 'secondaryButtonTextColor', value: brand[700], description: 'Texto botones secundarios' },
  { name: 'secondaryButtonBorderColor', value: brand[200], description: 'Borde botones secundarios' },
  { name: 'cardBgColor', value: brand[50], description: 'Fondo cards, paneles' },
  { name: 'cardBorderColor', value: brand[100], description: 'Borde cards' },
  { name: 'inputBgColor', value: brand[0], description: 'Fondo inputs' },
  { name: 'inputBorderColor', value: brand[200], description: 'Borde inputs' },
  { name: 'iconColor', value: brand[400], description: 'Color iconos' },
  { name: 'appBarBg', value: brand[100], description: 'Fondo Navbar/AppBar (azul claro en light)' },
  { name: 'appBarShadow', value: `0 4px 16px ${brand[100]}40`, description: 'Sombra Navbar' },
  { name: 'bgGradient', value: `linear-gradient(to right, ${brand[100]}, ${brand[50]}, ${brand[200]})`, description: 'Gradiente fondo principal' },
  {
    name: 'overlayGradient',
    value: `linear-gradient(135deg, ${brand[100]} 40%, ${brand[200]} 100%)`,
    description: 'Gradiente overlays/hovers',
  },
  { name: 'dataGridHeaderBg', value: brand[600], description: 'Fondo cabecera DataGrid' },
  { name: 'dataGridHeaderTextColor', value: brand[50], description: 'Texto cabecera DataGrid' },
  { name: 'dataGridRowBg', value: brand[50], description: 'Fondo filas DataGrid' },
  { name: 'dataGridRowHoverBg', value: brand[100], description: 'Fondo fila hover' },
  { name: 'dataGridSelectedBg', value: brand[200], description: 'Fondo fila seleccionada' },
  { name: 'dataGridTextColor', value: brand[400], description: 'Texto celdas DataGrid' },
  { name: 'chartCartesianGrid', value: brand[0], description: 'Líneas grilla en gráficos' },
  { name: 'chartLinePrimaryColor', value: brand[200], description: 'Línea principal en gráficos' },
  { name: 'chartLineSecundaryColor', value: brand[400], description: 'Línea secundaria' },
  { name: 'chartBarPrimaryColor', value: brand[300], description: 'Barra primaria' },
  { name: 'chartBarSecundaryColor', value: brand[200], description: 'Barra secundaria' },
  { name: 'chartBarTertiaryColor', value: brand[400], description: 'Barra terciaria' },
  { name: 'chartPiePrimaryColor', value: brand[200], description: 'Slice pie 1' },
  { name: 'chartPieSecundaryColor', value: brand[300], description: 'Slice pie 2' },
  { name: 'chartPieTertiaryColor', value: brand[500], description: 'Slice pie 3' },
  { name: 'chartPieQuaternaryColor', value: purple[400], description: 'Slice pie 4' },
  { name: 'chartPieQuinaryColor', value: purple[500], description: 'Slice pie 5' },
  { name: 'chartPieSenaryColor', value: purple[600], description: 'Slice pie 6' },
]

/**
 * Coincide con getDefaultPaletteVars(…, 'dark') en use-palette-vars.tsx.
 * Plantilla opcional para cargar estilos pensados en modo oscuro desde Estilos de filial.
 */
export const PALETTE_DARK_DEFAULT_VALUES: PaletteTokenInfo[] = [
  { name: 'textColor', value: brand[50], description: 'Texto principal (oscuro)' },
  { name: 'textSecondaryColor', value: brand[200], description: 'Texto secundario (oscuro)' },
  { name: 'buttonBgColor', value: brand[400], description: 'Fondo botones primarios' },
  { name: 'buttonTextColor', value: brand[50], description: 'Texto botones primarios (oscuro)' },
  { name: 'buttonBgColorSecondary', value: brand[200], description: 'Fondo botones secundarios' },
  { name: 'secondaryButtonTextColor', value: brand[700], description: 'Texto botones secundarios' },
  { name: 'secondaryButtonBorderColor', value: brand[200], description: 'Borde botones secundarios' },
  { name: 'cardBgColor', value: brand[800], description: 'Fondo cards, paneles (oscuro)' },
  { name: 'cardBorderColor', value: brand[900], description: 'Borde cards (oscuro)' },
  { name: 'inputBgColor', value: brand[900], description: 'Fondo inputs (oscuro)' },
  { name: 'inputBorderColor', value: brand[600], description: 'Borde inputs (oscuro)' },
  { name: 'iconColor', value: brand[100], description: 'Color iconos (oscuro)' },
  { name: 'appBarBg', value: brand[900], description: 'Fondo Navbar (oscuro)' },
  { name: 'appBarShadow', value: `0 4px 16px ${brand[800]}80`, description: 'Sombra Navbar (oscuro)' },
  {
    name: 'bgGradient',
    value: `linear-gradient(to right, ${brand[800]}, ${brand[900]}, ${brand[600]})`,
    description: 'Gradiente fondo principal (oscuro)',
  },
  {
    name: 'overlayGradient',
    value: `linear-gradient(135deg, ${brand[800]} 40%, ${brand[400]} 100%)`,
    description: 'Gradiente overlays (oscuro)',
  },
  { name: 'dataGridHeaderBg', value: brand[900], description: 'Cabecera DataGrid (oscuro)' },
  { name: 'dataGridHeaderTextColor', value: brand[50], description: 'Texto cabecera DataGrid' },
  { name: 'dataGridRowBg', value: brand[800], description: 'Fondo filas DataGrid (oscuro)' },
  { name: 'dataGridRowHoverBg', value: brand[700], description: 'Hover fila (oscuro)' },
  { name: 'dataGridSelectedBg', value: brand[600], description: 'Fila seleccionada (oscuro)' },
  { name: 'dataGridTextColor', value: brand[50], description: 'Texto celdas (oscuro)' },
  { name: 'chartCartesianGrid', value: gray[100], description: 'Grilla en gráficos' },
  { name: 'chartLinePrimaryColor', value: brand[100], description: 'Línea principal (oscuro)' },
  { name: 'chartLineSecundaryColor', value: brand[300], description: 'Línea secundaria (oscuro)' },
  { name: 'chartBarPrimaryColor', value: brand[200], description: 'Barra primaria (oscuro)' },
  { name: 'chartBarSecundaryColor', value: brand[400], description: 'Barra secundaria (oscuro)' },
  { name: 'chartBarTertiaryColor', value: brand[900], description: 'Barra terciaria (oscuro)' },
  { name: 'chartPiePrimaryColor', value: brand[200], description: 'Slice pie 1 (oscuro)' },
  { name: 'chartPieSecundaryColor', value: brand[400], description: 'Slice pie 2 (oscuro)' },
  { name: 'chartPieTertiaryColor', value: brand[900], description: 'Slice pie 3 (oscuro)' },
  { name: 'chartPieQuaternaryColor', value: purple[600], description: 'Slice pie 4 (oscuro)' },
  { name: 'chartPieQuinaryColor', value: purple[700], description: 'Slice pie 5 (oscuro)' },
  { name: 'chartPieSenaryColor', value: purple[800], description: 'Slice pie 6 (oscuro)' },
]

/**
 * Valores exactos de la plantilla clara: en modo oscuro no se aplican si siguen iguales
 * (asume que vinieron de "Agregar desde plantilla" pensada para tema claro).
 */
export const FILIAL_LIGHT_TEMPLATE_SEED_VALUES: ReadonlyMap<PaletteVarName, string> = new Map(
  PALETTE_DEFAULT_VALUES.map((t) => [t.name, t.value])
)

/** Lista de plantilla según variante de tema (UI filial). */
export function getPaletteTemplateList(variant: 'light' | 'dark'): PaletteTokenInfo[] {
  return variant === 'light' ? PALETTE_DEFAULT_VALUES : PALETTE_DARK_DEFAULT_VALUES
}

/** Obtiene el valor por defecto de un token por nombre */
export function getDefaultValueForToken(name: string): string | undefined {
  return PALETTE_DEFAULT_VALUES.find((t) => t.name === name)?.value
}
