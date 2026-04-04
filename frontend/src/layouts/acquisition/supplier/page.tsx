'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllSupplier } from '@api/acquisition/supplier/get-all-supplier-api'
import { SaveSupplierApi } from '@api/acquisition/supplier/save-supplier-api'

interface SupplierRow {
  id: string
  name: string
  type: string
  country: string
  contactInfo: string
  shippingDaysMin: number
  shippingDaysMax: number
  active: boolean
}

const emptyForm: SupplierRow = {
  id: '',
  name: '',
  type: 'ALIEXPRESS',
  country: '',
  contactInfo: '',
  shippingDaysMin: 7,
  shippingDaysMax: 30,
  active: true,
}

const SupplierLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem, setEditItem] = useState<SupplierRow>(emptyForm)

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('lbl_name'), flex: 1, minWidth: 150 },
    { field: 'type', headerName: t('lbl_type'), width: 130 },
    { field: 'country', headerName: t('lbl_country'), width: 120 },
    { field: 'contactInfo', headerName: t('lbl_contact'), flex: 1, minWidth: 150 },
    { field: 'shippingDaysMin', headerName: t('lbl_ship_min'), width: 100, type: 'number' },
    { field: 'shippingDaysMax', headerName: t('lbl_ship_max'), width: 100, type: 'number' },
    {
      field: 'actions',
      headerName: t('lbl_actions'),
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => handleEdit(params.row)}>
          {t('lbl_edit')}
        </Button>
      ),
    },
  ]

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllSupplier({ page: 0, size: 100 })
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

  const handleEdit = (row: SupplierRow) => {
    setEditItem({ ...row })
    setOpenDialog(true)
  }

  const handleNew = () => {
    setEditItem({ ...emptyForm })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    const res = await SaveSupplierApi(editItem)
    if (res.correct) {
      setOpenDialog(false)
      fetchData()
    }
  }

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
        title={t('lbl_suppliers')}
        action={
          <Tooltip title={t('lbl_add_new')}>
            <Fab color="primary" size="small" aria-label="add" onClick={handleNew}>
              <PlusIcon />
            </Fab>
          </Tooltip>
        }
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editItem.id ? t('lbl_edit') : t('lbl_add_new')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label={t('lbl_name')}
            value={editItem.name}
            onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('lbl_type')}
            value={editItem.type}
            onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
            select
            fullWidth
          >
            <MenuItem value="ALIEXPRESS">AliExpress</MenuItem>
            <MenuItem value="CJ_DROPSHIPPING">CJ Dropshipping</MenuItem>
            <MenuItem value="CUSTOM">Custom</MenuItem>
          </TextField>
          <TextField
            label={t('lbl_country')}
            value={editItem.country}
            onChange={(e) => setEditItem({ ...editItem, country: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('lbl_contact')}
            value={editItem.contactInfo}
            onChange={(e) => setEditItem({ ...editItem, contactInfo: e.target.value })}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('lbl_ship_min')}
              type="number"
              value={editItem.shippingDaysMin}
              onChange={(e) => setEditItem({ ...editItem, shippingDaysMin: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label={t('lbl_ship_max')}
              type="number"
              value={editItem.shippingDaysMax}
              onChange={(e) => setEditItem({ ...editItem, shippingDaysMax: Number(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('lbl_cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>{t('lbl_save')}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default SupplierLayoutForm
