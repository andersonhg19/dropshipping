/**
 * Hook para formatear números con decimales configurados desde variables de entorno
 */

/**
 * Hook que retorna funciones para formatear números
 * El número de decimales se obtiene de la variable de entorno NEXT_PUBLIC_DECIMALS_NUMBER
 * Por defecto usa 0 decimales si no está configurado
 *
 * @returns Objeto con funciones formatNumber y formatCurrency
 */
export const useFormatNumber = () => {
  // Obtener el número de decimales desde las variables de entorno
  // Por defecto usa 0 si no está configurado
  const decimalsNumber = parseInt(process.env.NEXT_PUBLIC_DECIMALS_NUMBER || '0', 10)

  /**
   * Formatea un número con el formato de-DE (punto para miles, coma para decimales)
   */
  const formatNumber = (value: number) =>
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: decimalsNumber,
      maximumFractionDigits: decimalsNumber,
    }).format(value)

  /**
   * Formatea un número como moneda en formato colombiano (COP)
   */
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: decimalsNumber,
      maximumFractionDigits: decimalsNumber,
    }).format(value)

  return {
    formatNumber,
    formatCurrency,
  }
}
