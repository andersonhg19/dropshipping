'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, TextField, Typography } from '@mui/material'
import { Folder, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { GetAllCategory } from '@api/commerce/category/get-all-category-api'
import { SaveCategoryApi } from '@api/commerce/category/save-category-api'

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
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [editId, setEditId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllCategory({ page: 0, size: 200 })
      if (res?.correct) setCategories(res.object?.list ?? [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    await SaveCategoryApi({
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
    fetchData()
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
                    <Folder size={20} color="#0071e3" />
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
                </Box>
              </Box>
              {getChildren(cat.id).map(child => (
                <Box key={child.id} onClick={() => openEdit(child)}
                  sx={{
                    ml: 6, mt: 0.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
                    bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' }, transition: 'all 0.15s',
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{child.name}</Typography>
                </Box>
              ))}
            </motion.div>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20, pb: 1 }}>
          {editId ? 'Editar Categoria' : 'Nueva Categoria'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <TextField label="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
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
    </Box>
  )
}
