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
import { Globe, MapPin, Package, Plus, Star, Truck } from 'lucide-react'

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
  reliabilityScore?: number
  active: boolean
}

const emptyForm: SupplierRow = {
  id: '',
  name: '',
  type: 'ALIEXPRESS',
  country: 'CN',
  contactInfo: '',
  shippingDaysMin: 7,
  shippingDaysMax: 30,
  active: true,
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Truck }> = {
  CJ_DROPSHIPPING: { label: 'CJ Dropshipping', color: '#2563eb', bg: '#eff6ff', icon: Truck },
  EPROLO: { label: 'EPROLO', color: '#7c3aed', bg: '#f5f3ff', icon: Package },
  ALIEXPRESS: { label: 'AliExpress', color: '#ea580c', bg: '#fff7ed', icon: Globe },
  LOCAL: { label: 'Local', color: '#16a34a', bg: '#f0fdf4', icon: MapPin },
  OTHER: { label: 'Otro', color: '#6b7280', bg: '#f9fafb', icon: Package },
}

const flagMap: Record<string, string> = {
  CN: '\u{1F1E8}\u{1F1F3}', CO: '\u{1F1E8}\u{1F1F4}', US: '\u{1F1FA}\u{1F1F8}',
  MX: '\u{1F1F2}\u{1F1FD}', ES: '\u{1F1EA}\u{1F1F8}', BR: '\u{1F1E7}\u{1F1F7}',
  DE: '\u{1F1E9}\u{1F1EA}', UK: '\u{1F1EC}\u{1F1E7}', JP: '\u{1F1EF}\u{1F1F5}',
  KR: '\u{1F1F0}\u{1F1F7}', IN: '\u{1F1EE}\u{1F1F3}', TR: '\u{1F1F9}\u{1F1F7}',
}

const getFlag = (code: string) => flagMap[code?.toUpperCase()] || '\u{1F30D}'
const getType = (t: string) => typeConfig[t] || typeConfig.OTHER

const SupplierLayoutForm = () => {
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<SupplierRow>(emptyForm)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllSupplier({ page: 0, size: 100 })
      if (res.correct && res.object) setRows(res.object.list || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    const res = await SaveSupplierApi(form)
    if (res.correct) { setOpen(false); fetchData() }
  }

  const upd = (field: keyof SupplierRow, val: string | number) =>
    setForm((f) => ({ ...f, [field]: val }))

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 0 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Proveedores
        </Typography>
        <Button
          onClick={() => { setForm({ ...emptyForm }); setOpen(true) }}
          startIcon={<Plus size={16} />}
          sx={{
            borderRadius: 99, px: 3, py: 1, fontWeight: 600, fontSize: 14,
            bgcolor: '#000', color: '#fff', textTransform: 'none',
            '&:hover': { bgcolor: '#1a1a1a' },
          }}
        >
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Loading skeletons */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: 4 }} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!loading && rows.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10, color: '#9ca3af' }}>
          <Package size={48} strokeWidth={1.2} style={{ margin: '0 auto 12px' }} />
          <Typography sx={{ fontSize: 18, fontWeight: 500 }}>Sin proveedores</Typography>
          <Typography sx={{ fontSize: 14, mt: 0.5 }}>Agrega tu primer proveedor para comenzar</Typography>
        </Box>
      )}

      {/* Supplier cards */}
      <AnimatePresence>
        {!loading && rows.map((s, i) => {
          const cfg = getType(s.type)
          const Icon = cfg.icon
          const avg = Math.round((s.shippingDaysMin + s.shippingDaysMax) / 2)

          return (
            <motion.div
              key={s.id || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
            >
              <Box
                onClick={() => { setForm({ ...s }); setOpen(true) }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2.5, mb: 1.5,
                  p: 2.5, borderRadius: 4, cursor: 'pointer',
                  bgcolor: '#fff', border: '1px solid #f0f0f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: '#e0e0e0',
                  },
                }}
              >
                {/* Icon */}
                <Box sx={{
                  width: 52, height: 52, borderRadius: 3, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  bgcolor: cfg.bg,
                }}>
                  <Icon size={24} color={cfg.color} strokeWidth={1.8} />
                </Box>

                {/* Center info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </Typography>
                    <Box sx={{
                      px: 1, py: 0.2, borderRadius: 2, fontSize: 11, fontWeight: 600,
                      color: cfg.color, bgcolor: cfg.bg, lineHeight: 1.6,
                    }}>
                      {cfg.label}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                    {getFlag(s.country)} {s.country}{s.contactInfo ? ` \u00B7 ${s.contactInfo}` : ''}
                  </Typography>
                </Box>

                {/* Right: shipping + score */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <Box sx={{
                    px: 1.5, py: 0.5, borderRadius: 2, bgcolor: '#f3f4f6',
                    fontSize: 13, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap',
                  }}>
                    ~{avg} dias
                  </Box>
                  {s.reliabilityScore != null && s.reliabilityScore > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#f59e0b' }}>
                      <Star size={14} fill="#f59e0b" />
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{s.reliabilityScore}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20 }}>
          {form.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Nombre" value={form.name} onChange={(e) => upd('name', e.target.value)} fullWidth size="small" />
          <TextField label="Tipo" value={form.type} onChange={(e) => upd('type', e.target.value)} select fullWidth size="small">
            {Object.entries(typeConfig).map(([k, v]) => (
              <MenuItem key={k} value={k}>{v.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Pais (codigo)" value={form.country} onChange={(e) => upd('country', e.target.value)} fullWidth size="small"
            placeholder="CN, US, CO..." helperText={form.country ? `${getFlag(form.country)} ${form.country}` : ''} />
          <TextField label="Contacto" value={form.contactInfo} onChange={(e) => upd('contactInfo', e.target.value)} fullWidth size="small" />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Envio min (dias)" type="number" value={form.shippingDaysMin}
              onChange={(e) => upd('shippingDaysMin', Number(e.target.value))} fullWidth size="small" />
            <TextField label="Envio max (dias)" type="number" value={form.shippingDaysMax}
              onChange={(e) => upd('shippingDaysMax', Number(e.target.value))} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', color: '#6b7280' }}>
            Cancelar
          </Button>
          <Button onClick={handleSave} sx={{
            borderRadius: 2, textTransform: 'none', fontWeight: 600,
            bgcolor: '#000', color: '#fff', px: 3,
            '&:hover': { bgcolor: '#1a1a1a' },
          }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SupplierLayoutForm
