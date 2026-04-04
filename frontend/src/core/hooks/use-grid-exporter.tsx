'use client'

import { useCallback } from 'react'

import type { GridColDef } from '@mui/x-data-grid'

type FileType = 'xlsx' | 'pdf' | 'csv'

export interface UseGridExporterOptions {
  columns: GridColDef[]
  rows: any[]
  fileName?: string
  excludeFields?: string[]
  valueFormatters?: Record<string, (value: any, row: any) => any>
}

const headerOf = (col: GridColDef) => col.headerName ?? col.field ?? ''

/** Util: extraer valor aplicando valueGetter/valueFormatter si existen (soporta firmas vieja/nueva) */
const cellValue = (col: GridColDef, row: any, externalFormatters?: UseGridExporterOptions['valueFormatters']) => {
  // Normaliza field
  const field = (col.field ?? '') as string

  // 1) valueGetter de la columna (soporta 2 firmas)
  let baseValue: any
  const vg: any = col.valueGetter as any

  if (typeof vg === 'function') {
    // Firma antigua: (value, row, column, api) -> length >= 2
    // Firma nueva: (params) -> length <= 1
    if (vg.length >= 2) {
      baseValue = vg(row?.[field], row, col, undefined)
    } else {
      baseValue = vg({
        id: row?.id,
        field,
        row,
        value: row?.[field],
      })
    }
  } else {
    baseValue = row?.[field]
  }

  // 2) valueFormatter de la columna (soporta 2 firmas)
  const vf: any = col.valueFormatter as any
  if (typeof vf === 'function') {
    if (vf.length >= 2) {
      // firma antigua: (value, row)
      baseValue = vf(baseValue, row)
    } else {
      // firma nueva: (params)
      baseValue = vf({ value: baseValue, field, id: row?.id, row })
    }
  }

  // 3) valueFormatters externos (opcionales)
  const ext = externalFormatters?.[field]
  if (typeof ext === 'function') {
    baseValue = ext(baseValue, row)
  }

  // 4) Sanitizar valores complejos
  if (baseValue == null) return ''
  if (typeof baseValue === 'object') return JSON.stringify(baseValue)
  return String(baseValue)
}

export function useGridExporter(opts: UseGridExporterOptions) {
  const { columns, rows, fileName = 'export', excludeFields = [], valueFormatters = {} } = opts

  /** Columnas exportables (oculta las con col.field vacío y las excluidas) */
  const exportableCols = columns.filter((c) => c.field && !excludeFields.includes(c.field) && c.type !== 'actions')

  /** Construir matriz [headers[], ...rows[]] */
  const buildMatrix = useCallback(() => {
    const headers = exportableCols.map(headerOf)
    const data = rows.map((row) => exportableCols.map((col) => cellValue(col, row, valueFormatters)))
    return { headers, data }
  }, [exportableCols, rows, valueFormatters])

  /** Descargar blob (client-only) */
  const downloadBlob = useCallback(
    (blob: Blob, ext: string) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.${ext}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
    [fileName]
  )

  /** Exportar CSV (fallback útil) */
  const exportCSV = useCallback(() => {
    const { headers, data } = buildMatrix()
    const csv = [headers, ...data]
      .map((row) =>
        row
          .map((v) => {
            const s = String(v ?? '')
            // Escapar comillas y separar por coma
            if (s.includes('"') || s.includes(',') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`
            }
            return s
          })
          .join(',')
      )
      .join('\n')

    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }) // BOM para Excel
    downloadBlob(blob, 'csv')
  }, [buildMatrix, downloadBlob])

  /** Exportar XLSX con import dinámico (SheetJS) */
  const exportXLSX = useCallback(async () => {
    const { headers, data } = buildMatrix()
    const xlsx = await import('xlsx') // lazy
    const ws = xlsx.utils.aoa_to_sheet([headers, ...data])
    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, ws, 'Sheet1')
    const wbOut = xlsx.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbOut], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    downloadBlob(blob, 'xlsx')
  }, [buildMatrix, downloadBlob])

  /** Exportar PDF con jsPDF + autoTable (import dinámico) */
  const exportPDF = useCallback(async () => {
    const { headers, data } = buildMatrix()
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    autoTable(doc, {
      head: [headers],
      body: data,
      styles: { fontSize: 9, cellPadding: 6 },
      headStyles: { fillColor: [33, 150, 243] }, // azul MUI aprox (opcional)
      margin: { top: 32, left: 24, right: 24, bottom: 24 },
    })

    const blob = doc.output('blob')
    downloadBlob(blob, 'pdf')
  }, [buildMatrix, downloadBlob])

  /** API pública */
  const exportTo = useCallback(
    async (type: FileType) => {
      if (type === 'csv') return exportCSV()
      if (type === 'xlsx') return exportXLSX()
      if (type === 'pdf') return exportPDF()
    },
    [exportCSV, exportXLSX, exportPDF]
  )

  return {
    exportTo,
    exportCSV,
    exportXLSX,
    exportPDF,
  }
}
