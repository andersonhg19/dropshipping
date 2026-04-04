'use client'

import { useEffect, useMemo } from 'react'

import type { GridColDef } from '@mui/x-data-grid'

import { useGridExportContext } from '@hooks/context/grid-export-context'

type Params = {
  columns: GridColDef[]
  rows: any[]
  fileName?: string
  excludeFields?: string[]
  valueFormatters?: Record<string, (value: any, row: any) => any>
  autoOpen?: boolean
}

export function useGridExportPanel({
  columns,
  rows,
  fileName = 'export',
  excludeFields = [],
  valueFormatters = {},
  autoOpen = false,
}: Params) {
  const { enable, disable, openDrawer } = useGridExportContext()

  // Firma mínima y estable
  const signature = useMemo(
    () => ({
      cols: columns.map((c) => ({ f: c.field, h: c.headerName, t: c.type })),
      rowsLen: rows?.length ?? 0,
      fileName,
      exclLen: excludeFields.length,
    }),
    [columns, rows?.length, fileName, excludeFields.length]
  )

  useEffect(() => {
    // Solo intentamos habilitar cuando cambie la firma calculada
    enable({ columns, rows, fileName, excludeFields, valueFormatters })
    if (autoOpen) openDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature])

  // Deshabilitar únicamente al desmontar
  useEffect(() => {
    return () => {
      disable()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
