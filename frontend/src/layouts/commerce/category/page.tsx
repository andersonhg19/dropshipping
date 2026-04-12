'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Skeleton, Snackbar, TextField, Typography } from '@mui/material'
import { Folder, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { GetAllCategory } from '@api/commerce/category/get-all-category-api'
import { SaveCategoryApi } from '@api/commerce/category/save-category-api'
import ConfirmDialog from '@components/atoms/confirm-dialog'

interface CategoryItem {
  id: number
  name: string
  parentId: number | null
  icon: string | null
  active: boolean
}

const initial = { name: '', parentId: '', icon: '' }

export default function CategoryLayoutForm() {
  const { t } = useTranslation()
  const palette = usePaletteVars()
  const PAGE_SIZE = 20
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [editId, setEditId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; item: CategoryItem | null }>({ open: false, item: null })

  const fetchData = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const res = await GetAllCategory({ page, size: PAGE_SIZE })
      if (res?.correct) {
        setCategories(res.object?.list ?? [])
        setTotalPages(res.object?.totalPage ?? 1)
        setCurrentPage(page)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    const res = await SaveCategoryApi({
      ...(editId ? { id: editId } : {}),
      idCompany: 1, idSubsidiary: 1, idModifiedBy: 1,
      name: form.name,
      parentId: form.parentId ? Number(form.parentId) : null,
      icon: form.icon || null,
      active: true,
    })
    setOpen(false)
    setForm(initial)
    setEditId(null)
    if (res?.correct) {
      setSnackbar({ open: true, message: editId ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: res?.message || 'Error al guardar la categoria.', severity: 'error' })
    }
    fetchData(currentPage)
  }

  const handleDelete = async () => {
    const item = confirmDelete.item
    if (!item) return
    setConfirmDelete({ open: false, item: null })
    const res = await SaveCategoryApi({
      id: item.id, idCompany: 1, idSubsidiary: 1, idModifiedBy: 1,
      name: item.name, parentId: item.parentId, icon: item.icon, active: false,
    })
    if (res?.correct) {
      setSnackbar({ open: true, message: 'Categoria eliminada correctamente.', severity: 'success' })
      fetchData(currentPage)
    } else {
      setSnackbar({ open: true, message: res?.message || 'Error al eliminar la categoria.', severity: 'error' })
    }
  }

  const openEdit = (cat: CategoryItem) => {
    setForm({ name: cat.name, parentId: cat.parentId?.toString() || '', icon: cat.icon || '' })
    setEditId(cat.id)
    setOpen(true)
  }

  const roots = categories.filter(c => !c.parentId)
  const getChildren = (parentId: number) => categories.filter(c => c.parentId === parentId)

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: -0.5 }}>
            {t('lbl_categories')}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>
            Organiza tus productos en categorias
          </Typography>
        </Box>
        <Button
          onClick={() => { setForm(initial); setEditId(null); setOpen(true) }}
          sx={{
            bgcolor: '#0071e3', color: '#fff', borderRadius: 99, px: 3, py: 1.2,
            textTransform: 'none', fontWeight: 600, fontSize: 14,
            '&:hover': { bgcolor: '#0077ED', transform: 'translateY(-1px)' },
            transition: 'all 0.2s',
          }}
          startIcon={<Plus size={18} />}
        >
          Nueva Categoria
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : categories.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Folder size={48} color="#ccc" />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>No hay categorias. Crea la primera.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {roots.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Box
                onClick={() => openEdit(cat)}
                sx={{
                  p: 2.5, borderRadius: 3, cursor: 'pointer',
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' },
                  transition: 'all 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#0071e315', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Folder size={20} color="#0071e3" aria-hidden="true" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{cat.name}</Typography>
                    {getChildren(cat.id).length > 0 && (
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3 }}>
                        {getChildren(cat.id).map(c => c.name).join(', ')}
                      </Typography>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 99 }}>
                    {getChildren(cat.id).length} sub
                  </Typography>
                  <IconButton
                    size="small"
                    aria-label={`Eliminar categoria ${cat.name}`}
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, item: cat }) }}
                    sx={{
                      opacity: 0.4, '&:hover': { opacity: 1, color: '#ef4444', bgcolor: '#ef444410' },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </IconButton>
                </Box>
              </Box>
              {getChildren(cat.id).map(child => (
                <Box key={child.id} onClick={() => openEdit(child)}
                  sx={{
                    ml: 6, mt: 0.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' }, transition: 'all 0.15s',
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{child.name}</Typography>
                  <IconButton
                    size="small"
                    aria-label={`Eliminar subcategoria ${child.name}`}
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, item: child }) }}
                    sx={{
                      opacity: 0.3, '&:hover': { opacity: 1, color: '#ef4444', bgcolor: '#ef444410' },
                      transition: 'all 0.2s', p: 0.5,
                    }}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </IconButton>
                </Box>
              ))}
            </motion.div>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 4 }}>
          <Button
            disabled={currentPage === 0}
            onClick={() => fetchData(currentPage - 1)}
            sx={{
              borderRadius: 99, px: 2.5, py: 0.8, textTransform: 'none', fontWeight: 600,
              fontSize: 13, bgcolor: 'action.hover', color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' }, '&:disabled': { opacity: 0.4 },
            }}
          >
            Anterior
          </Button>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
            Pagina {currentPage + 1} de {totalPages}
          </Typography>
          <Button
            disabled={currentPage >= totalPages - 1}
            onClick={() => fetchData(currentPage + 1)}
            sx={{
              borderRadius: 99, px: 2.5, py: 0.8, textTransform: 'none', fontWeight: 600,
              fontSize: 13, bgcolor: 'action.hover', color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' }, '&:disabled': { opacity: 0.4 },
            }}
          >
            Siguiente
          </Button>
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth aria-labelledby="category-dialog-title" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle id="category-dialog-title" sx={{ fontWeight: 700, fontSize: 20, pb: 1 }}>
          {editId ? 'Editar Categoria' : 'Nueva Categoria'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <TextField label="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            fullWidth size="small" required aria-required="true" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Categoria padre" select value={form.parentId}
            onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
            fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <option value="">Ninguna (raiz)</option>
            {categories.filter(c => c.id !== editId).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 99, textTransform: 'none', color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}
            sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0077ED' } }}>
            {editId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Eliminar categoria"
        message={`Estas seguro de eliminar la categoria "${confirmDelete.item?.name || ''}"? Esta accion la desactivara.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, item: null })}
        destructive
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
