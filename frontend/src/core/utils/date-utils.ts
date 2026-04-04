/**
 * Utilidades para manejo de fechas con zona horaria configurable
 */

/**
 * Obtiene la zona horaria configurada en las variables de entorno
 * Por defecto usa 'America/Bogota' si no está configurada
 */
export function getTimezone(): string {
  return process.env.NEXT_PUBLIC_TIMEZONE || 'America/Bogota'
}

/**
 * Obtiene la fecha actual interpretada en la zona horaria configurada
 * Retorna un objeto Date que representa la fecha/hora actual en la zona horaria configurada
 */
export function getCurrentDateInTimezone(): Date {
  const timezone = getTimezone()
  const now = new Date()

  // Formatear la fecha actual en la zona horaria especificada
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(now)
  const year = parseInt(parts.find((p) => p.type === 'year')!.value)
  const month = parseInt(parts.find((p) => p.type === 'month')!.value) - 1 // Mes es 0-indexed
  const day = parseInt(parts.find((p) => p.type === 'day')!.value)
  const hour = parseInt(parts.find((p) => p.type === 'hour')!.value)
  const minute = parseInt(parts.find((p) => p.type === 'minute')!.value)
  const second = parseInt(parts.find((p) => p.type === 'second')!.value)

  // Crear un objeto Date con los valores de la zona horaria configurada
  // Esto crea una fecha local que representa esos valores
  return new Date(year, month, day, hour, minute, second)
}

/**
 * Formatea una fecha para input datetime-local (formato: YYYY-MM-DDTHH:mm)
 * La fecha se interpreta y formatea en la zona horaria configurada
 */
export function formatDateInputForTimezone(date: Date): string {
  const timezone = getTimezone()

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const year = parts.find((p) => p.type === 'year')!.value
  const month = parts.find((p) => p.type === 'month')!.value
  const day = parts.find((p) => p.type === 'day')!.value
  const hour = parts.find((p) => p.type === 'hour')!.value
  const minute = parts.find((p) => p.type === 'minute')!.value

  return `${year}-${month}-${day}T${hour}:${minute}`
}

/**
 * Convierte una fecha de string (formato datetime-local) a Date
 * El string se interpreta como una fecha en la zona horaria configurada
 * Nota: Los inputs datetime-local no tienen información de zona horaria,
 * así que interpretamos el valor como si fuera en la zona horaria configurada
 */
export function parseDateFromTimezone(value: string): Date | null {
  if (!value) return null

  const [datePart, timePart] = value.split('T')
  if (!datePart || !timePart) return null

  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute = 0] = timePart.split(':').map(Number)

  // Crear un objeto Date local con estos valores
  // El input datetime-local ya representa una fecha/hora local sin zona horaria
  return new Date(year, month - 1, day, hour, minute)
}
