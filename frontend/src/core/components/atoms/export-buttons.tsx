'use client'

import React, { useState } from 'react'
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { getKeyApi } from '@utils/utilities'

interface ExportButtonsProps {
  filters?: Record<string, any>
}

export default function ExportButtons({ filters = {} }: ExportButtonsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'excel') => {
    setAnchorEl(null)
    setExporting(true)
    try {
      const token = await getKeyApi()
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
      const url = `${BASE_URL}/COMMERCE-SERVICE/vn-api/v2/export/${format}`

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'lng': 'es',
        },
        body: JSON.stringify({ idCompany: 1, ...filters }),
      })

      if (resp.ok) {
        const blob = await resp.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = format === 'csv' ? 'visnex-products.csv' : 'visnex-products.xlsx'
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (err) {
      console.error('Export error:', err)
    }
    setExporting(false)
  }

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={exporting}
        sx={{
          borderRadius: 99, textTransform: 'none', fontWeight: 500, fontSize: 13,
          border: '1px solid', borderColor: 'divider', color: 'text.secondary', px: 2,
          '&:hover': { borderColor: '#0071e3', color: '#0071e3' },
        }}
        startIcon={<Download size={16} />}
      >
        {exporting ? 'Exportando...' : 'Exportar'}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 3, mt: 1, minWidth: 180 } }}>
        <MenuItem onClick={() => handleExport('csv')} sx={{ gap: 1.5, py: 1.2 }}>
          <FileText size={18} color="#059669" />
          <Typography sx={{ fontSize: 14 }}>CSV</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')} sx={{ gap: 1.5, py: 1.2 }}>
          <FileSpreadsheet size={18} color="#2563eb" />
          <Typography sx={{ fontSize: 14 }}>Excel (.xlsx)</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}
