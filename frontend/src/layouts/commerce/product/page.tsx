'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { PackageOpen, Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllProduct } from '@api/commerce/product/get-all-product-api'
import { SaveProductApi } from '@api/commerce/product/save-product-api'

interface ProductRow {
  id: string; title: string; description: string
  basePrice: number; sellingPrice: number; status: string
  idCategory: string; categoryName: string
  idSupplier: string; supplierName: string; active: boolean
}

const emptyForm: ProductRow = {
  id: '', title: '', description: '', basePrice: 0, sellingPrice: 0,
  status: 'DRAFT', idCategory: '', categoryName: '',
  idSupplier: '', supplierName: '', active: true,
}

const STATUS_OPTIONS = ['DRAFT', 'READY', 'ENRICHED', 'PUBLISHED', 'ARCHIVED'] as const
const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9CA3AF', READY: '#3B82F6', ENRICHED: '#8B5CF6',
  PUBLISHED: '#10B981', ARCHIVED: '#EF4444',
}
const APPLE_BLUE = '#0071e3'

const MotionBox = motion.create(Box)

const ProductLayoutForm = () => {
  const { t } = useTranslation()
  const { cardBgColor } = usePaletteVars()

  const [rows, setRows] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem, setEditItem] = useState<ProductRow>(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [saveError, setSaveError] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllProduct({ page: 0, size: 100 })
      if (res.correct && res.object) setRows(res.object.list || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = rows.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSave = async () => {
    setSaveError('')
    if (!editItem.title || editItem.title.trim() === '') {
      setSaveError('El titulo del producto es obligatorio.')
      return
    }
    if (editItem.basePrice < 0) {
      setSaveError('El precio base no puede ser negativo.')
      return
    }
    const res = await SaveProductApi(editItem)
    if (res.correct) { setSaveError(''); setOpenDialog(false); fetchData() }
    else { setSaveError(res.message || 'Error al guardar el producto.') }
  }

  const openNew = () => { setSaveError(''); setEditItem({ ...emptyForm }); setOpenDialog(true) }
  const openEdit = (row: ProductRow) => { setSaveError(''); setEditItem({ ...row }); setOpenDialog(true) }
  const set = (field: keyof ProductRow, val: string | number) =>
    setEditItem((prev) => ({ ...prev, [field]: val }))

  const pill = {
    display: 'inline-flex', alignItems: 'center', borderRadius: '999px',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
    px: 2, py: 0.5, userSelect: 'none' as const,
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      {/* --- Header --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {t('lbl_products')}
        </Typography>
        <Button
          onClick={openNew}
          startIcon={<Plus size={18} />}
          sx={{
            bgcolor: APPLE_BLUE, color: '#fff', borderRadius: '999px',
            textTransform: 'none', fontWeight: 600, px: 3, py: 1,
            '&:hover': { bgcolor: '#005ecb' },
          }}
        >
          {t('lbl_add_new')}
        </Button>
      </Box>

      {/* --- Filters --- */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 4 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', bgcolor: cardBgColor || '#f5f5f7',
          borderRadius: '12px', px: 1.5, py: 0.5, flex: { xs: '1 1 100%', sm: '0 1 280px' },
        }}>
          <Search size={18} color="#86868b" />
          <input
            placeholder={t('lbl_search') || 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              padding: '8px', fontSize: '14px', width: '100%', color: 'inherit',
            }}
          />
        </Box>
        {['ALL', ...STATUS_OPTIONS].map((s) => (
          <Box
            key={s}
            onClick={() => setStatusFilter(s)}
            sx={{
              ...pill,
              bgcolor: statusFilter === s ? (s === 'ALL' ? '#1d1d1f' : STATUS_COLORS[s]) : '#f5f5f7',
              color: statusFilter === s ? '#fff' : '#6e6e73',
              '&:hover': { opacity: 0.85 },
            }}
          >
            {s === 'ALL' ? t('lbl_all') || 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </Box>
        ))}
      </Box>

      {/* --- Grid --- */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '16px' }} />
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, color: '#86868b' }}>
          <PackageOpen size={56} strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {t('lbl_no_data') || 'No products found'}
          </Typography>
          <Typography sx={{ fontSize: 14, mt: 0.5, color: '#aeaeb2' }}>
            {t('lbl_try_different_filter') || 'Try a different filter or create a new product'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
          <AnimatePresence>
            {filtered.map((row, i) => (
              <MotionBox
                key={row.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                onClick={() => openEdit(row)}
                sx={{
                  bgcolor: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,.08)', transition: 'transform .25s, box-shadow .25s',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,.12)' },
                }}
              >
                {/* Image placeholder */}
                <Box sx={{ bgcolor: '#f5f5f7', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PackageOpen size={40} color="#c7c7cc" strokeWidth={1.3} />
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.title || 'Untitled'}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: row.sellingPrice > 0 ? '#1b8a4a' : '#aeaeb2', mb: 1 }}>
                    {row.sellingPrice > 0 ? `$${row.sellingPrice.toFixed(2)}` : 'Sin precio'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      ...pill, fontSize: '11px', px: 1.2, py: 0.25,
                      bgcolor: `${STATUS_COLORS[row.status] || '#9CA3AF'}18`,
                      color: STATUS_COLORS[row.status] || '#9CA3AF',
                    }}>
                      {row.status}
                    </Box>
                    {row.supplierName && (
                      <Typography sx={{ fontSize: 12, color: '#aeaeb2' }}>
                        {row.supplierName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </MotionBox>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* --- Dialog --- */}
      <Dialog
        open={openDialog} onClose={() => setOpenDialog(false)}
        maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          {editItem.id ? t('lbl_edit') : t('lbl_add_new')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <TextField label={t('lbl_title')} value={editItem.title} onChange={(e) => set('title', e.target.value)} fullWidth size="small" />
          <TextField label={t('lbl_description')} value={editItem.description} onChange={(e) => set('description', e.target.value)} multiline rows={3} fullWidth size="small" />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label={t('lbl_base_price')} type="number" value={editItem.basePrice} onChange={(e) => set('basePrice', Number(e.target.value))} fullWidth size="small" />
            <TextField label={t('lbl_selling_price')} type="number" value={editItem.sellingPrice} onChange={(e) => set('sellingPrice', Number(e.target.value))} fullWidth size="small" />
          </Box>
          <TextField label={t('lbl_status')} value={editItem.status} onChange={(e) => set('status', e.target.value)} select fullWidth size="small">
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          <TextField label={t('lbl_category')} value={editItem.idCategory} onChange={(e) => set('idCategory', e.target.value)} fullWidth size="small" />
          {saveError && (
            <Typography sx={{ color: '#ef4444', fontSize: 13, fontWeight: 500, mt: 0.5 }}>
              {saveError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: '999px', textTransform: 'none', color: '#6e6e73' }}>
            {t('lbl_cancel')}
          </Button>
          <Button onClick={handleSave} sx={{ bgcolor: APPLE_BLUE, color: '#fff', borderRadius: '999px', textTransform: 'none', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#005ecb' } }}>
            {t('lbl_save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProductLayoutForm
