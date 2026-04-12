'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Skeleton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PackageOpen,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { getKeyApi } from '@utils/utilities'

import { GetAllProduct } from '@api/commerce/product/get-all-product-api'
import { SaveProductApi } from '@api/commerce/product/save-product-api'

import Breadcrumbs from '@components/atoms/breadcrumbs'
import ConfirmDialog from '@components/atoms/confirm-dialog'
import ExportButtons from '@components/atoms/export-buttons'

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
const PAGE_SIZE = 12

const MotionBox = motion.create(Box)

const ProductLayoutForm = () => {
  const { t } = useTranslation()
  const { cardBgColor } = usePaletteVars()
  const router = useRouter()

  const [rows, setRows] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem, setEditItem] = useState<ProductRow>(emptyForm)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [saveError, setSaveError] = useState('')
  const [snack, setSnack] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Loading action state
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  // Sort
  const [sortBy, setSortBy] = useState('title')

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {})

  // Debounce ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ---- Fetch data (server-side filtering + pagination) ---- */
  const fetchData = useCallback(async (page = 0, searchTerm = '', status = 'ALL') => {
    setLoading(true)
    try {
      const filter: Record<string, any> = {
        page,
        size: PAGE_SIZE,
        active: true,
      }
      if (searchTerm.trim()) filter.title = searchTerm.trim()
      if (status !== 'ALL') filter.status = status

      const res = await GetAllProduct(filter)
      if (res.correct && res.object) {
        setRows(res.object.list || [])
        setTotalPages(res.object.totalPage ?? 1)
        setCurrentPage(page)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(0, search, statusFilter) }, [fetchData])

  /* ---- Search with debounce ---- */
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSelected(new Set())
      fetchData(0, value, statusFilter)
    }, 500)
  }

  const handleStatusFilter = (s: string) => {
    setStatusFilter(s)
    setSelected(new Set())
    fetchData(0, search, s)
  }

  /* ---- Pagination ---- */
  const goPage = (page: number) => {
    if (page < 0 || page >= totalPages) return
    setSelected(new Set())
    fetchData(page, search, statusFilter)
  }

  /* ---- Save / Edit ---- */
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
    if (res.correct) {
      setSaveError('')
      setOpenDialog(false)
      setSnack(editItem.id ? 'Producto actualizado' : 'Producto creado')
      fetchData(currentPage, search, statusFilter)
    } else {
      setSaveError(res.message || 'Error al guardar el producto.')
    }
  }

  const openNew = () => { setSaveError(''); setEditItem({ ...emptyForm }); setOpenDialog(true) }
  const openEdit = (row: ProductRow) => { setSaveError(''); setEditItem({ ...row }); setOpenDialog(true) }
  const set = (field: keyof ProductRow, val: string | number) =>
    setEditItem((prev) => ({ ...prev, [field]: val }))

  /* ---- Soft Delete ---- */
  const handleDelete = (row: ProductRow) => {
    setConfirmMsg(`Eliminar "${row.title}"? Esta accion desactivara el producto.`)
    setConfirmAction(() => async () => {
      const res = await SaveProductApi({ ...row, active: false })
      if (res.correct) {
        setSnack('Producto eliminado')
        fetchData(currentPage, search, statusFilter)
      } else {
        setSnack(res.message || 'Error al eliminar')
      }
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  /* ---- Enrich (AI) ---- */
  const handleEnrich = async (productId: string) => {
    setLoadingAction('enrich-' + productId)
    try {
      const token = await getKeyApi()
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
      const resp = await fetch(`${BASE_URL}/COMMERCE-SERVICE/vn-api/v2/ai-enrichment/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'lng': 'es' },
        body: JSON.stringify({ productId: Number(productId), idCompany: 1 }),
      })
      const data = await resp.json()
      if (data.correct) {
        setSnack('Producto enriquecido con IA')
        fetchData(currentPage, search, statusFilter)
      } else {
        setSnack(data.message || 'Error al enriquecer')
      }
    } catch {
      setSnack('Error de conexion al enriquecer')
    } finally {
      setLoadingAction(null)
    }
  }

  /* ---- Publish ---- */
  const handlePublish = async (productId: string) => {
    setLoadingAction('publish-' + productId)
    try {
      const token = await getKeyApi()
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
      const resp = await fetch(`${BASE_URL}/COMMERCE-SERVICE/vn-api/v2/woocommerce/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'lng': 'es' },
        body: JSON.stringify({ productId: Number(productId), channelId: 1 }),
      })
      const data = await resp.json()
      if (data.correct) {
        setSnack('Producto publicado')
        fetchData(currentPage, search, statusFilter)
      } else {
        setSnack(data.message || 'Error al publicar')
      }
    } catch {
      setSnack('Error de conexion al publicar')
    } finally {
      setLoadingAction(null)
    }
  }

  /* ---- Selection ---- */
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === rows.length) setSelected(new Set())
    else setSelected(new Set(rows.map((r) => r.id)))
  }

  /* ---- Batch actions ---- */
  const batchEnrich = async () => {
    setSnack('Enriqueciendo productos...')
    for (const id of selected) await handleEnrich(id)
    setSelected(new Set())
    setSnack('Enriquecimiento por lotes completado')
  }

  const batchPublish = async () => {
    setSnack('Publicando productos...')
    for (const id of selected) await handlePublish(id)
    setSelected(new Set())
    setSnack('Publicacion por lotes completada')
  }

  const batchDelete = () => {
    setConfirmMsg(`Eliminar ${selected.size} producto(s) seleccionado(s)?`)
    setConfirmAction(() => async () => {
      for (const id of selected) {
        const row = rows.find((r) => r.id === id)
        if (row) await SaveProductApi({ ...row, active: false })
      }
      setSelected(new Set())
      setSnack(`${selected.size} producto(s) eliminado(s)`)
      fetchData(currentPage, search, statusFilter)
      setConfirmOpen(false)
    })
    setConfirmOpen(true)
  }

  /* ---- Styles ---- */
  const pill = {
    display: 'inline-flex', alignItems: 'center', borderRadius: '999px',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
    px: 2, py: 0.5, userSelect: 'none' as const,
  }

  const actionBtn = (bg: string, hover: string) => ({
    bgcolor: bg, color: '#fff', borderRadius: '999px', textTransform: 'none' as const,
    fontWeight: 600, fontSize: 12, px: 1.5, py: 0.5, minWidth: 0,
    '&:hover': { bgcolor: hover },
  })

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, pb: selected.size > 0 ? 12 : 5 }}>
      <Breadcrumbs />
      {/* --- Header --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {t('lbl_products')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <ExportButtons filters={{ status: statusFilter !== 'ALL' ? statusFilter : undefined, title: search || undefined }} />
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
      </Box>

      {/* --- Filters --- */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', mb: 4 }}>
        <Box role="search" sx={{
          display: 'flex', alignItems: 'center', bgcolor: cardBgColor || 'action.hover',
          borderRadius: '12px', px: 1.5, py: 0.5, flex: { xs: '1 1 100%', sm: '0 1 280px' },
        }}>
          <Search size={18} color="#86868b" aria-hidden="true" />
          <input
            aria-label="Buscar productos"
            placeholder={t('lbl_search') || 'Buscar...'}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              padding: '8px', fontSize: '14px', width: '100%', color: 'inherit',
            }}
          />
        </Box>
        <TextField
          select size="small" value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); fetchData(0, search, statusFilter) }}
          sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 99 } }}
          aria-label="Ordenar por"
        >
          <MenuItem value="title">Nombre A-Z</MenuItem>
          <MenuItem value="-title">Nombre Z-A</MenuItem>
          <MenuItem value="-basePrice">Precio mayor</MenuItem>
          <MenuItem value="basePrice">Precio menor</MenuItem>
          <MenuItem value="-creation">Mas reciente</MenuItem>
        </TextField>
        {rows.length > 0 && (
          <Box
            onClick={toggleSelectAll}
            sx={{ ...pill, bgcolor: selected.size === rows.length ? '#1d1d1f' : 'action.hover', color: selected.size === rows.length ? '#fff' : 'text.secondary', '&:hover': { opacity: 0.85 } }}
          >
            {selected.size === rows.length ? 'Deseleccionar' : 'Seleccionar todo'}
          </Box>
        )}
        {['ALL', ...STATUS_OPTIONS].map((s) => (
          <Box
            key={s}
            onClick={() => handleStatusFilter(s)}
            sx={{
              ...pill,
              bgcolor: statusFilter === s ? (s === 'ALL' ? '#1d1d1f' : STATUS_COLORS[s]) : 'action.hover',
              color: statusFilter === s ? '#fff' : 'text.secondary',
              '&:hover': { opacity: 0.85 },
            }}
          >
            {s === 'ALL' ? t('lbl_all') || 'Todos' : s.charAt(0) + s.slice(1).toLowerCase()}
          </Box>
        ))}
      </Box>

      {/* --- Grid --- */}
      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={300} sx={{ borderRadius: '16px' }} />
          ))}
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, color: 'text.secondary' }}>
          <PackageOpen size={56} strokeWidth={1.2} style={{ marginBottom: 16 }} />
          <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
            {t('lbl_no_data') || 'No se encontraron productos'}
          </Typography>
          <Typography sx={{ fontSize: 14, mt: 0.5, color: 'text.disabled' }}>
            {t('lbl_try_different_filter') || 'Intenta con otro filtro o crea un nuevo producto'}
          </Typography>
        </Box>
      ) : (
        <Box role="list" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 3 }}>
          <AnimatePresence>
            {rows.map((row, i) => (
              <MotionBox
                role="listitem"
                aria-label={`Producto: ${row.title || 'Sin titulo'}, precio: ${row.sellingPrice > 0 ? '$' + row.sellingPrice.toFixed(2) : 'Sin precio'}, estado: ${row.status}`}
                key={row.id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                sx={{
                  bgcolor: 'background.paper', borderRadius: '16px', overflow: 'hidden', position: 'relative',
                  boxShadow: selected.has(row.id) ? `0 0 0 2px ${APPLE_BLUE}` : '0 1px 3px rgba(0,0,0,.08)',
                  transition: 'transform .25s, box-shadow .25s',
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: selected.has(row.id) ? `0 4px 16px rgba(0,113,227,.25)` : '0 8px 24px rgba(0,0,0,.12)' },
                }}
                onClick={(e) => {
                  // Don't navigate if clicking on checkbox, button, or action elements
                  const target = e.target as HTMLElement
                  if (target.closest('button') || target.closest('input') || target.closest('a')) return
                  router.push(`/dashboard/products/${row.id}`)
                }}
              >
                {/* Checkbox (top-left) */}
                <Checkbox
                  checked={selected.has(row.id)}
                  onChange={() => toggleSelect(row.id)}
                  size="small"
                  inputProps={{ 'aria-label': `Seleccionar producto ${row.title || 'Sin titulo'}` } as React.InputHTMLAttributes<HTMLInputElement>}
                  sx={{ position: 'absolute', top: 4, left: 4, zIndex: 2, bgcolor: 'rgba(255,255,255,.85)', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,.95)' } }}
                />

                {/* Delete button (top-right) */}
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={`Eliminar producto ${row.title || 'Sin titulo'}`}
                  onClick={(e) => { e.stopPropagation(); handleDelete(row) }}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleDelete(row) } }}
                  sx={{
                    position: 'absolute', top: 8, right: 8, zIndex: 2,
                    width: 28, height: 28, borderRadius: '8px',
                    bgcolor: 'rgba(255,255,255,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all .2s',
                    '&:hover': { bgcolor: '#fef2f2', color: '#ef4444' },
                    '&:focus-visible': { outline: '2px solid #0071e3', outlineOffset: '2px' },
                  }}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </Box>

                {/* Image placeholder */}
                <Box
                  onClick={() => openEdit(row)}
                  sx={{ bgcolor: 'action.hover', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <PackageOpen size={40} color="#c7c7cc" strokeWidth={1.3} aria-hidden="true" />
                </Box>

                <Box sx={{ p: 2.5 }} onClick={() => openEdit(row)} style={{ cursor: 'pointer' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.title || 'Sin titulo'}
                  </Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: row.sellingPrice > 0 ? '#1b8a4a' : 'text.disabled', mb: 1 }}>
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
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                        {row.supplierName}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Action buttons based on status */}
                <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 1 }}>
                  {row.status === 'DRAFT' && (
                    <Button
                      size="small"
                      aria-label={`Enriquecer producto ${row.title || 'Sin titulo'}`}
                      startIcon={<Sparkles size={14} aria-hidden="true" />}
                      onClick={(e) => { e.stopPropagation(); handleEnrich(row.id) }}
                      disabled={loadingAction === 'enrich-' + row.id}
                      sx={actionBtn('#8B5CF6', '#7C3AED')}
                    >
                      {loadingAction === 'enrich-' + row.id ? 'Enriqueciendo...' : 'Enriquecer con IA'}
                    </Button>
                  )}
                  {row.status === 'ENRICHED' && (
                    <Button
                      size="small"
                      aria-label={`Publicar producto ${row.title || 'Sin titulo'}`}
                      startIcon={<Upload size={14} aria-hidden="true" />}
                      onClick={(e) => { e.stopPropagation(); handlePublish(row.id) }}
                      disabled={loadingAction === 'publish-' + row.id}
                      sx={actionBtn('#10B981', '#059669')}
                    >
                      {loadingAction === 'publish-' + row.id ? 'Publicando...' : 'Publicar'}
                    </Button>
                  )}
                  {row.status === 'PUBLISHED' && (
                    <Button
                      size="small"
                      aria-label={`Ver producto ${row.title || 'Sin titulo'} en tienda`}
                      startIcon={<ExternalLink size={14} aria-hidden="true" />}
                      onClick={(e) => e.stopPropagation()}
                      href={process.env.NEXT_PUBLIC_STORE_URL || '#'}
                      target="_blank"
                      component="a"
                      sx={actionBtn('#3B82F6', '#2563EB')}
                    >
                      Ver en tienda
                    </Button>
                  )}
                </Box>
              </MotionBox>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {/* --- Pagination --- */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 5 }}>
          <Button
            aria-label="Pagina anterior"
            onClick={() => goPage(currentPage - 1)}
            disabled={currentPage === 0}
            startIcon={<ChevronLeft size={16} aria-hidden="true" />}
            sx={{
              borderRadius: '999px', textTransform: 'none', fontWeight: 600, fontSize: 13,
              border: '1px solid', borderColor: 'divider', color: 'text.secondary', px: 2.5,
              '&:hover': { borderColor: APPLE_BLUE, color: APPLE_BLUE },
              '&:disabled': { opacity: 0.4 },
            }}
          >
            Anterior
          </Button>
          <Typography aria-live="polite" sx={{ fontSize: 14, fontWeight: 500, color: 'text.secondary' }}>
            Pagina {currentPage + 1} de {totalPages}
          </Typography>
          <Button
            aria-label="Pagina siguiente"
            onClick={() => goPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            endIcon={<ChevronRight size={16} aria-hidden="true" />}
            sx={{
              borderRadius: '999px', textTransform: 'none', fontWeight: 600, fontSize: 13,
              border: '1px solid', borderColor: 'divider', color: 'text.secondary', px: 2.5,
              '&:hover': { borderColor: APPLE_BLUE, color: APPLE_BLUE },
              '&:disabled': { opacity: 0.4 },
            }}
          >
            Siguiente
          </Button>
        </Box>
      )}

      {/* --- Batch action bar --- */}
      <AnimatePresence>
        {selected.size > 0 && (
          <MotionBox
            role="toolbar"
            aria-label="Acciones por lote"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            sx={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              bgcolor: '#1d1d1f', color: '#fff', borderRadius: '16px',
              px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 2,
              boxShadow: '0 12px 40px rgba(0,0,0,.3)', zIndex: 1300,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600, mr: 1 }}>
              {selected.size} seleccionado(s)
            </Typography>
            <Button
              size="small"
              startIcon={<Sparkles size={14} />}
              onClick={batchEnrich}
              sx={{ ...actionBtn('#8B5CF6', '#7C3AED'), fontSize: 12 }}
            >
              Enriquecer
            </Button>
            <Button
              size="small"
              startIcon={<Upload size={14} />}
              onClick={batchPublish}
              sx={{ ...actionBtn('#10B981', '#059669'), fontSize: 12 }}
            >
              Publicar
            </Button>
            <Button
              size="small"
              startIcon={<Trash2 size={14} />}
              onClick={batchDelete}
              sx={{ ...actionBtn('#EF4444', '#DC2626'), fontSize: 12 }}
            >
              Eliminar
            </Button>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* --- Edit/Create Dialog --- */}
      <Dialog
        open={openDialog} onClose={() => setOpenDialog(false)}
        maxWidth="sm" fullWidth
        aria-labelledby="product-dialog-title"
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle id="product-dialog-title" sx={{ fontWeight: 700, fontSize: 20 }}>
          {editItem.id ? t('lbl_edit') : t('lbl_add_new')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <TextField label={t('lbl_title')} value={editItem.title} onChange={(e) => set('title', e.target.value)} fullWidth size="small" required aria-required="true" />
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
            <Typography role="alert" sx={{ color: '#ef4444', fontSize: 13, fontWeight: 500, mt: 0.5 }}>
              {saveError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: '999px', textTransform: 'none', color: 'text.secondary' }}>
            {t('lbl_cancel')}
          </Button>
          <Button onClick={handleSave} sx={{ bgcolor: APPLE_BLUE, color: '#fff', borderRadius: '999px', textTransform: 'none', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#005ecb' } }}>
            {t('lbl_save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Confirm Dialog --- */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar"
        message={confirmMsg}
        confirmText="Eliminar"
        cancelText="Cancelar"
        destructive
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* --- Snackbar --- */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '& .MuiSnackbarContent-root': { borderRadius: '12px', fontWeight: 500 } }}
      />
    </Box>
  )
}

export default ProductLayoutForm
