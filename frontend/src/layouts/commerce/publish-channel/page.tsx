'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Skeleton, Snackbar, TextField, Typography } from '@mui/material'
import { Globe, Plus, Trash2, Wifi, WifiOff } from 'lucide-react'
import { motion } from 'framer-motion'

import { GetAllPublishChannel } from '@api/commerce/publish-channel/get-all-publish-channel-api'
import { SavePublishChannelApi } from '@api/commerce/publish-channel/save-publish-channel-api'
import ConfirmDialog from '@components/atoms/confirm-dialog'

interface ChannelItem { id: number; name: string; type: string; status: string; lastSync: string | null; autoSync: boolean; active: boolean }

const typeColors: Record<string, string> = { WOOCOMMERCE: '#7B2D8E', FACEBOOK_MARKETPLACE: '#1877F2', INSTAGRAM_SHOPPING: '#E4405F', MERCADOLIBRE: '#FFE600', CSV_EXPORT: '#6B7280' }
const typeLabels: Record<string, string> = { WOOCOMMERCE: 'WooCommerce', FACEBOOK_MARKETPLACE: 'Facebook', INSTAGRAM_SHOPPING: 'Instagram', MERCADOLIBRE: 'MercadoLibre', CSV_EXPORT: 'CSV Export' }
const initial = { name: '', type: 'WOOCOMMERCE', config: '', autoSync: false }

export default function PublishChannelLayoutForm() {
  const PAGE_SIZE = 20
  const [channels, setChannels] = useState<ChannelItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [editId, setEditId] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; item: ChannelItem | null }>({ open: false, item: null })

  const fetchData = useCallback(async (page = 0) => {
    setLoading(true)
    try {
      const res = await GetAllPublishChannel({ page, size: PAGE_SIZE })
      if (res?.correct) {
        setChannels(res.object?.list ?? [])
        setTotalPages(res.object?.totalPage ?? 1)
        setCurrentPage(page)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    const res = await SavePublishChannelApi({ ...(editId ? { id: editId } : {}), idCompany: 1, idSubsidiary: 1, idModifiedBy: 1, name: form.name, type: form.type, config: form.config || '{}', autoSync: form.autoSync, status: 'DISCONNECTED', active: true })
    setOpen(false); setForm(initial); setEditId(null)
    if (res?.correct) {
      setSnackbar({ open: true, message: editId ? 'Canal actualizado correctamente.' : 'Canal creado correctamente.', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: res?.message || 'Error al guardar el canal.', severity: 'error' })
    }
    fetchData(currentPage)
  }

  const handleDelete = async () => {
    const item = confirmDelete.item
    if (!item) return
    setConfirmDelete({ open: false, item: null })
    const res = await SavePublishChannelApi({
      id: item.id, idCompany: 1, idSubsidiary: 1, idModifiedBy: 1,
      name: item.name, type: item.type, config: '{}', autoSync: item.autoSync,
      status: item.status, active: false,
    })
    if (res?.correct) {
      setSnackbar({ open: true, message: 'Canal desconectado correctamente.', severity: 'success' })
      fetchData(currentPage)
    } else {
      setSnackbar({ open: true, message: res?.message || 'Error al desconectar el canal.', severity: 'error' })
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>Canales de Publicacion</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>Conecta con multiples plataformas de venta</Typography>
        </Box>
        <Button onClick={() => { setForm(initial); setEditId(null); setOpen(true) }}
          sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#0077ED', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}
          startIcon={<Plus size={18} />}>Nuevo Canal</Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1,2].map(i => <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 4 }} />)}</Box>
      : channels.length === 0 ? <Box sx={{ textAlign: 'center', py: 8 }}><Globe size={48} color="#ccc" /><Typography sx={{ mt: 2, color: 'text.secondary' }}>No hay canales. Conecta tu primera tienda.</Typography></Box>
      : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {channels.map((ch, i) => (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Box onClick={() => { setForm({ name: ch.name, type: ch.type, config: '', autoSync: ch.autoSync }); setEditId(ch.id); setOpen(true) }}
                sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', cursor: 'pointer', borderLeft: `4px solid ${typeColors[ch.type] || '#ccc'}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: `${typeColors[ch.type] || '#ccc'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={24} color={typeColors[ch.type] || '#ccc'} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{ch.name}</Typography>
                      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{typeLabels[ch.type] || ch.type}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={ch.status === 'CONNECTED' ? <Wifi size={14} /> : <WifiOff size={14} />}
                      label={ch.status === 'CONNECTED' ? 'Conectado' : ch.status === 'ERROR' ? 'Error' : 'Desconectado'}
                      size="small"
                      sx={{ borderRadius: 99, fontWeight: 500, fontSize: 12,
                        bgcolor: ch.status === 'CONNECTED' ? '#10b98120' : ch.status === 'ERROR' ? '#ef444420' : '#9ca3af20',
                        color: ch.status === 'CONNECTED' ? '#059669' : ch.status === 'ERROR' ? '#dc2626' : '#6b7280' }} />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete({ open: true, item: ch }) }}
                      sx={{
                        opacity: 0.4, '&:hover': { opacity: 1, color: '#ef4444', bgcolor: '#ef444410' },
                        transition: 'all 0.2s',
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>}

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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20, pb: 1 }}>{editId ? 'Editar Canal' : 'Nuevo Canal'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <TextField label="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Tipo" select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            {Object.entries(typeLabels).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
          </TextField>
          <TextField label="Config (JSON)" value={form.config} onChange={e => setForm(p => ({ ...p, config: e.target.value }))} fullWidth size="small" multiline rows={3}
            placeholder='{"siteUrl":"...", "consumerKey":"...", "consumerSecret":"..."}' sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 99, textTransform: 'none', color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()} sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0077ED' } }}>
            {editId ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmDelete.open}
        title="Desconectar canal"
        message={`Estas seguro de desconectar el canal "${confirmDelete.item?.name || ''}"? Esta accion lo desactivara.`}
        confirmText="Desconectar"
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
