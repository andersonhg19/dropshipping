'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  TextField,
  Tooltip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllCategory } from '@api/commerce/category/get-all-category-api'
import { SaveCategoryApi } from '@api/commerce/category/save-category-api'

interface CategoryRow {
  id: string
  name: string
  parentId: string
  parentName: string
  icon: string
  active: boolean
}

const emptyForm: CategoryRow = {
  id: '',
  name: '',
  parentId: '',
  parentName: '',
  icon: '',
  active: true,
}

const CategoryLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem, setEditItem] = useState<CategoryRow>(emptyForm)

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('lbl_name'), flex: 1, minWidth: 200 },
    { field: 'parentName', headerName: t('lbl_parent_category'), flex: 1, minWidth: 150 },
    { field: 'icon', headerName: t('lbl_icon'), width: 120 },
    {
      field: 'active',
      headerName: t('lbl_active'),
      width: 100,
      type: 'boolean',
    },
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
      const res = await GetAllCategory({ page: 0, size: 100 })
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

  const handleEdit = (row: CategoryRow) => {
    setEditItem({ ...row })
    setOpenDialog(true)
  }

  const handleNew = () => {
    setEditItem({ ...emptyForm })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    const res = await SaveCategoryApi(editItem)
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
        title={t('lbl_categories')}
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
            label={t('lbl_parent_category')}
            value={editItem.parentId}
            onChange={(e) => setEditItem({ ...editItem, parentId: e.target.value })}
            fullWidth
            helperText={t('lbl_leave_empty_for_root')}
          />
          <TextField
            label={t('lbl_icon')}
            value={editItem.icon}
            onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })}
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

export default CategoryLayoutForm
