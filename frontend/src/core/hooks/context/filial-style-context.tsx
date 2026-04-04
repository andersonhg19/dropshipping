'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { usePathname } from 'next/navigation'

import { GetAllFilialStyleApi } from '@api/admin/filial/get-all-filial-style-api'

import { GetAllFilialStyleOutputInterface } from '@interfaces/output/admin/get-all-filial-style-output-interface'
import { GetAllFilialStyleResponseInterface } from '@interfaces/response/admin/get-all-filial-style-response-interface'

import { getUserCompanyContext } from '@utils/utilities'

import { isValidPaletteVarName } from '@core/constants/palette-var-names'

export type FilialStyleOverrides = Record<string, string>

interface FilialStyleContextType {
  /** Overrides de estilos por token (name -> value). Solo incluye estilos activos de la subsidiaria. */
  overrides: FilialStyleOverrides
  /** Fuerza recarga de estilos desde la API (útil tras guardar en Estilos de Subsidiaria). */
  refreshStyles: () => void
  /** Indica si hay una carga en curso (opcional, para UI). */
  isLoading: boolean
}

const FilialStyleContext = createContext<FilialStyleContextType | undefined>(undefined)

/** Rutas donde NO se cargan estilos de subsidiaria (usuario no autenticado o sin subsidiaria). */
const PUBLIC_PATHS = ['/users/login', '/auth/reset-password']

function isPublicPath(pathname: string | null): boolean {
  if (!pathname) return true
  if (pathname === '/') return true
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export function FilialStyleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [overrides, setOverrides] = useState<FilialStyleOverrides>({})
  const [isLoading, setIsLoading] = useState(false)
  const cacheRef = useRef<Map<string, FilialStyleOverrides>>(new Map())

  const fetchStyles = useCallback(async (subsidiaryId: string) => {
    if (!subsidiaryId) return

    const numId = parseInt(subsidiaryId, 10)
    if (Number.isNaN(numId)) return

    const cached = cacheRef.current.get(subsidiaryId)
    if (cached) {
      setOverrides(cached)
      return
    }

    setIsLoading(true)
    try {
      const payload: GetAllFilialStyleOutputInterface = {
        id: '',
        idSubsidiary: numId,
        idCompany: '',
        name: '',
        value: '',
        type: '',
        typeValue: '',
        idModifiedBy: null,
        active: true,
        page: 0,
        size: 500,
      }

      const response = (await GetAllFilialStyleApi(payload)) as GetAllFilialStyleResponseInterface

      if (response?.correct && response?.object?.list) {
        const map: FilialStyleOverrides = {}
        for (const item of response.object.list) {
          if (item.active && item.name && item.value && isValidPaletteVarName(item.name)) {
            map[item.name] = item.value
          }
        }
        cacheRef.current.set(subsidiaryId, map)
        setOverrides(map)
      }
    } catch {
      // Fallback silencioso: se usan los defaults del theme
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshStyles = useCallback(() => {
    const { subsidiaryId } = getUserCompanyContext()
    if (!subsidiaryId) {
      setOverrides({})
      return
    }
    cacheRef.current.delete(subsidiaryId)
    fetchStyles(subsidiaryId)
  }, [fetchStyles])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isPublicPath(pathname)) {
      setOverrides({})
      return
    }

    const { subsidiaryId } = getUserCompanyContext()
    if (!subsidiaryId) {
      setOverrides({})
      return
    }

    fetchStyles(subsidiaryId)
  }, [pathname, fetchStyles])

  const value = useMemo<FilialStyleContextType>(
    () => ({ overrides, refreshStyles, isLoading }),
    [overrides, refreshStyles, isLoading]
  )

  return <FilialStyleContext.Provider value={value}>{children}</FilialStyleContext.Provider>
}

export function useFilialStyleContext(): FilialStyleContextType {
  const ctx = useContext(FilialStyleContext)
  if (ctx === undefined) {
    throw new Error('useFilialStyleContext debe usarse dentro de FilialStyleProvider')
  }
  return ctx
}

/** Hook opcional: devuelve overrides o objeto vacío si no hay provider (evita throw). */
export function useFilialStyleOverrides(): FilialStyleOverrides {
  const ctx = useContext(FilialStyleContext)
  return ctx?.overrides ?? {}
}
