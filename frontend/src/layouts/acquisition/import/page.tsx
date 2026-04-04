'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  Chip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllImportJob } from '@api/acquisition/import-job/get-all-import-job-api'

interface ImportJobRow {
  id: string
  fileName: string
  fileType: string
  status: string
  totalRecords: number
  processedRecords: number
  errorRecords: number
  idSupplier: string
  supplierName: string
}

const statusColorMap: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
  PENDING: 'default',
  PROCESSING: 'info',
  COMPLETED: 'success',
  PARTIAL: 'warning',
  FAILED: 'error',
}

const ImportLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [rows, setRows] = useState<ImportJobRow[]>([])
  const [loading, setLoading] = useState(false)

  const columns: GridColDef[] = [
    { field: 'fileName', headerName: t('lbl_file_name'), flex: 1, minWidth: 200 },
    { field: 'fileType', headerName: t('lbl_file_type'), width: 110 },
    {
      field: 'status',
      headerName: t('lbl_status'),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={statusColorMap[params.value as string] || 'default'}
          size="small"
        />
      ),
    },
    { field: 'supplierName', headerName: t('lbl_supplier'), width: 150 },
    { field: 'totalRecords', headerName: t('lbl_total'), width: 100, type: 'number' },
    { field: 'processedRecords', headerName: t('lbl_processed'), width: 120, type: 'number' },
    { field: 'errorRecords', headerName: t('lbl_errors'), width: 100, type: 'number' },
  ]

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllImportJob({ page: 0, size: 100 })
      if (res.correct && res.object) {
        setRows(res.object.list || [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Card
      elevation={1}
      sx={{
        background: cardBgColor,
        boxShadow: muiTheme.shadows[2],
        borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
        mb: { xs: 2, sm: 3 },
        border: `1px solid ${cardBorderColor}`,
        overflow: 'hidden',
      }}
    >
      <CardHeader
        sx={{ '& .MuiCardHeader-title': { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
        title={t('lbl_import_jobs')}
      />
      <CardContent>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </CardContent>
    </Card>
  )
}

export default ImportLayoutForm
