'use client'

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

import { UseGridExporterOptions } from '@hooks/use-grid-exporter'

type ExportConfig = Omit<UseGridExporterOptions, 'fileName'> & {
  fileName?: string
}

type GridExportContextType = {
  enabled: boolean
  open: boolean
  config: ExportConfig | null
  enable: (cfg: ExportConfig) => void
  disable: () => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
}

const GridExportContext = createContext<GridExportContextType | undefined>(undefined)

function makeSignature(cfg: ExportConfig | null) {
  if (!cfg) return ''
  // No serializamos funciones; usamos solo partes estables.
  const cols = (cfg.columns ?? []).map((c) => ({ f: c.field, h: c.headerName, t: c.type }))
  return JSON.stringify({
    fileName: cfg.fileName ?? 'export',
    cols,
    rowsLen: cfg.rows?.length ?? 0,
    exclLen: cfg.excludeFields?.length ?? 0,
  })
}

export function GridExportProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<ExportConfig | null>(null)
  const sigRef = useRef<string>('') // firma actual aplicada

  const enable = useCallback((cfg: ExportConfig) => {
    const nextSig = makeSignature(cfg)
    // Si la firma no cambió, NO actualizamos nada (evita renders en cascada).
    if (sigRef.current === nextSig) return

    sigRef.current = nextSig
    setConfig((prev) => (prev === cfg ? prev : cfg))
    setEnabled((prev) => (prev ? prev : true)) // solo si estaba en false
  }, [])

  const disable = useCallback(() => {
    if (!enabled && !config && !open && !sigRef.current) return
    setEnabled(false)
    setOpen(false)
    setConfig(null)
    sigRef.current = ''
  }, [enabled, config, open])

  const openDrawer = useCallback(() => {
    if (enabled) setOpen(true)
  }, [enabled])
  const closeDrawer = useCallback(() => setOpen(false), [])
  const toggleDrawer = useCallback(() => {
    if (enabled) setOpen((p) => !p)
  }, [enabled])

  const value = useMemo<GridExportContextType>(
    () => ({
      enabled,
      open,
      config,
      enable,
      disable,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [enabled, open, config, enable, disable, openDrawer, closeDrawer, toggleDrawer]
  )

  return <GridExportContext.Provider value={value}>{children}</GridExportContext.Provider>
}

export function useGridExportContext() {
  const ctx = useContext(GridExportContext)
  if (!ctx) throw new Error('useGridExportContext debe usarse dentro de GridExportProvider')
  return ctx
}
