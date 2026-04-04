'use client'

import * as React from 'react'

import { DataGrid, DataGridProps } from '@mui/x-data-grid'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

const CustomDataGrid: React.FC<DataGridProps> = ({ sx = {}, ...props }) => {
  const {
    dataGridHeaderBg,
    dataGridHeaderTextColor,
    dataGridRowBg,
    dataGridRowHoverBg,
    dataGridSelectedBg,
    dataGridTextColor,
    cardBorderColor,
  } = usePaletteVars()

  return (
    <DataGrid
      {...props}
      sx={{
        bgcolor: dataGridRowBg,
        color: dataGridTextColor,
        borderRadius: 2,
        border: 'none',
        minWidth: { xs: 500, sm: '100%' },
        // 👇 Usa background y aumenta la especificidad
        '--DataGrid-containerBackground': `${dataGridHeaderBg}`,
        '& .MuiDataGrid-columnHeaders': {
          background: `${dataGridHeaderBg} !important`,
          backgroundColor: `${dataGridHeaderBg} !important`,
          color: `${dataGridHeaderTextColor} !important`,
          fontWeight: 600,
          fontSize: { xs: '0.8rem', sm: '1rem' },
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          borderBottom: `2px solid ${cardBorderColor}`,
          boxShadow: 'none !important',
        },
        '& .MuiDataGrid-columnHeadersInner': {
          background: `${dataGridHeaderBg} !important`,
          backgroundColor: `${dataGridHeaderBg} !important`,
        },
        '& .MuiDataGrid-row': {
          bgcolor: dataGridRowBg,
        },
        '& .MuiDataGrid-row:hover': {
          bgcolor: dataGridRowHoverBg,
        },
        '& .MuiDataGrid-row.Mui-selected': {
          bgcolor: dataGridSelectedBg,
        },
        '& .MuiDataGrid-cell': {
          borderBottom: `1px solid ${cardBorderColor}`,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        },
        // 👇 Esto asegura que no se sobreescriba accidentalmente
        '& .MuiDataGrid-columnHeaders, .MuiDataGrid-columnHeadersInner': {
          background: `${dataGridHeaderBg} !important`,
        },
        ...sx,
      }}
    />
  )
}

export default CustomDataGrid
