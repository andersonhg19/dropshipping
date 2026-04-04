'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
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

import { GetAllProduct } from '@api/commerce/product/get-all-product-api'
import { SaveProductApi } from '@api/commerce/product/save-product-api'

interface ProductRow {
  id: string
  title: string
  description: string
  basePrice: number
  sellingPrice: number
  status: string
  idCategory: string
  categoryName: string
  idSupplier: string
  supplierName: string
  active: boolean
}

const emptyForm: ProductRow = {
  id: '',
  title: '',
  description: '',
  basePrice: 0,
  sellingPrice: 0,
  status: 'DRAFT',
  idCategory: '',
  categoryName: '',
  idSupplier: '',
  supplierName: '',
  active: true,
}

const statusColorMap: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  DRAFT: 'default',
  READY: 'info',
  PUBLISHED: 'success',
  PAUSED: 'warning',
}

const ProductLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [rows, setRows] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem, setEditItem] = useState<ProductRow>(emptyForm)

  const columns: GridColDef[] = [
    { field: 'title', headerName: t('lbl_title'), flex: 1, minWidth: 200 },
    {
      field: 'status',
      headerName: t('lbl_status'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={statusColorMap[params.value as string] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'basePrice',
      headerName: t('lbl_base_price'),
      width: 120,
      type: 'number',
      valueFormatter: (value: number) => `$${(value ?? 0).toFixed(2)}`,
    },
    {
      field: 'sellingPrice',
      headerName: t('lbl_selling_price'),
      width: 130,
      type: 'number',
      valueFormatter: (value: number) => `$${(value ?? 0).toFixed(2)}`,
    },
    { field: 'categoryName', headerName: t('lbl_category'), width: 140 },
    { field: 'supplierName', headerName: t('lbl_supplier'), width: 140 },
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
      const res = await GetAllProduct({ page: 0, size: 100 })
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

  const handleEdit = (row: ProductRow) => {
    setEditItem({ ...row })
    setOpenDialog(true)
  }

  const handleNew = () => {
    setEditItem({ ...emptyForm })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    const res = await SaveProductApi(editItem)
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
        title={t('lbl_products')}
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
            label={t('lbl_title')}
            value={editItem.title}
            onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('lbl_description')}
            value={editItem.description}
            onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('lbl_base_price')}
              type="number"
              value={editItem.basePrice}
              onChange={(e) => setEditItem({ ...editItem, basePrice: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label={t('lbl_selling_price')}
              type="number"
              value={editItem.sellingPrice}
              onChange={(e) => setEditItem({ ...editItem, sellingPrice: Number(e.target.value) })}
              fullWidth
            />
          </Box>
          <TextField
            label={t('lbl_status')}
            value={editItem.status}
            onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
            select
            fullWidth
          >
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="READY">Ready</MenuItem>
            <MenuItem value="PUBLISHED">Published</MenuItem>
            <MenuItem value="PAUSED">Paused</MenuItem>
          </TextField>
          <TextField
            label={t('lbl_category')}
            value={editItem.idCategory}
            onChange={(e) => setEditItem({ ...editItem, idCategory: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('lbl_supplier')}
            value={editItem.idSupplier}
            onChange={(e) => setEditItem({ ...editItem, idSupplier: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('lbl_cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>{t('lbl_save')}</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ProductLayoutForm
