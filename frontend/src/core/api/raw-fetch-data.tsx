// app/core/api/_internals/raw-fetch.ts
import i18n from '@config/language/i18n'

import { getApiUrl } from '@api/env'

export interface RawFetchOptions {
  timeoutMs?: number
  /**
   * Si true, retorna texto cuando no hay JSON (útil para endpoints con 204 o text/plain).
   * Por defecto: false (retorna null si no hay JSON).
   */
  acceptNonJson?: boolean
}

export interface RawHttpError<T = unknown> extends Error {
  status: number
  url: string
  payload?: T
}

/**
 * Igual firma que FetchData: (BASE_URL_MODULE, endpoint, options)
 * - Arma la URL como: base + BASE_URL_MODULE + endpoint
 * - NO envuelve en ReturnService; retorna el JSON tal cual.
 * - En error HTTP, lanza RawHttpError con status y payload del backend (si lo hay).
 */
export async function RawFetchData<T = unknown>(
  BASE_URL_MODULE: string,
  endpoint: string,
  options: RequestInit = {},
  rawOptions: RawFetchOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, acceptNonJson = false } = rawOptions

  const base = getApiUrl()
  const url = `${base}${BASE_URL_MODULE}${endpoint}`

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...options, signal: controller.signal })

    // Intenta parsear JSON si el content-type lo indica
    const contentType = (res.headers.get('content-type') || '').toLowerCase()
    const isJson = contentType.includes('application/json')

    const bodyText = await res.text()
    const parsed = isJson && bodyText ? (JSON.parse(bodyText) as T) : (null as unknown as T)

    if (!res.ok) {
      const err: RawHttpError<T> = Object.assign(new Error(`HTTP ${res.status} ${res.statusText}`), {
        status: res.status,
        url,
        payload: parsed,
      })
      // Caso especial 403: propagamos como error, no ReturnService
      if (res.status === 403 && !parsed) {
        err.message = String(i18n.t('inCorrectAccess') || 'Forbidden')
      }
      throw err
    }

    if (parsed !== null) return parsed
    if (acceptNonJson) return bodyText as unknown as T
    // Sin JSON y sin acceptNonJson → null (o undefined si prefieres)
    return null as unknown as T
  } catch (error: any) {
    // Si el error es de aborto (timeout), lanzar un error más descriptivo
    if (error.name === 'AbortError' || controller.signal.aborted) {
      const timeoutErr: RawHttpError<T> = Object.assign(
        new Error(`Request timeout after ${timeoutMs}ms - El servidor no respondió`),
        {
          status: 408,
          url,
        }
      )
      throw timeoutErr
    }
    // Si el error es de red (servidor no disponible, CORS, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkErr: RawHttpError<T> = Object.assign(
        new Error(
          `Error de red: No se pudo conectar con el servidor. Verifica que el backend esté disponible en ${url}`
        ),
        {
          status: 0,
          url,
        }
      )
      throw networkErr
    }
    // Re-lanzar otros errores
    throw error
  } finally {
    clearTimeout(id)
  }
}
