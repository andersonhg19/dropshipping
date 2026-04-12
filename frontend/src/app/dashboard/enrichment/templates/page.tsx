'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Skeleton, TextField, Typography } from '@mui/material'
import { FileText, Plus } from 'lucide-react'
import { motion } from 'framer-motion'

const types = [
  { value: 'FULL_PIPELINE', label: 'Pipeline Completo', desc: 'Titulo + Descripcion + Bullets + SEO' },
  { value: 'TITLE_ONLY', label: 'Solo Titulo', desc: 'Mejora el titulo del producto' },
  { value: 'DESCRIPTION_ONLY', label: 'Solo Descripcion', desc: 'Genera descripcion comercial' },
  { value: 'SEO_ONLY', label: 'Solo SEO', desc: 'Meta tags y keywords' },
]

interface TemplateItem { id: number; name: string; type: string; promptText: string; language: string; active: boolean }
const initial = { name: '', type: 'FULL_PIPELINE', promptText: '', language: 'es' }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [editId, setEditId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { GetAllPromptTemplate } = await import('@api/commerce/prompt-template/get-all-prompt-template-api')
      const res = await GetAllPromptTemplate({ page: 0, size: 50 })
      if (res?.correct) setTemplates(res.object?.list ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    try {
      const { SavePromptTemplateApi } = await import('@api/commerce/prompt-template/save-prompt-template-api')
      await SavePromptTemplateApi({ ...(editId ? { id: editId } : {}), idCompany: 1, idSubsidiary: 1, idModifiedBy: 1, ...form, active: true })
      setOpen(false); setForm(initial); setEditId(null); fetchData()
    } catch {}
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>Templates de IA</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>Prompts personalizados para enriquecer productos</Typography>
        </Box>
        <Button onClick={() => { setForm(initial); setEditId(null); setOpen(true) }}
          sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, px: 3, py: 1.2, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#0077ED', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}
          startIcon={<Plus size={18} />}>Nuevo Template</Button>
      </Box>

      {loading ? <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1,2].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />)}</Box>
      : templates.length === 0 ? <Box sx={{ textAlign: 'center', py: 8 }}><FileText size={48} color="#ccc" /><Typography sx={{ mt: 2, color: 'text.secondary' }}>No hay templates. Crea el primero.</Typography></Box>
      : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {templates.map((t, i) => {
            const typeInfo = types.find(tp => tp.value === t.type)
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Box onClick={() => { setForm({ name: t.name, type: t.type, promptText: t.promptText || '', language: t.language || 'es' }); setEditId(t.id); setOpen(true) }}
                  sx={{ p: 2.5, borderRadius: 3, cursor: 'pointer', bgcolor: 'background.paper',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' }, transition: 'all 0.2s' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#8b5cf615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} color="#8b5cf6" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{t.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{typeInfo?.desc || t.type}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 99 }}>{t.language?.toUpperCase()}</Typography>
                  </Box>
                </Box>
              </motion.div>
            )
          })}
        </Box>}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 20, pb: 1 }}>{editId ? 'Editar Template' : 'Nuevo Template'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
          <TextField label="Nombre" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Tipo" select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            {types.map(t => <MenuItem key={t.value} value={t.value}>{t.label} - {t.desc}</MenuItem>)}
          </TextField>
          <TextField label="Prompt" value={form.promptText} onChange={e => setForm(p => ({ ...p, promptText: e.target.value }))} fullWidth multiline rows={8}
            placeholder="Eres un experto en ecommerce. Genera contenido para: {{title}}..." helperText="Variables: {{title}}, {{description}}, {{price}}, {{category}}, {{tags}}"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Idioma" select value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
            <MenuItem value="es">Espanol</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 99, textTransform: 'none', color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name.trim() || !form.promptText.trim()}
            sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#0077ED' } }}>
            {editId ? 'Actualizar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
