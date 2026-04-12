'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, Chip, MenuItem, Skeleton, Snackbar, TextField, Typography } from '@mui/material'
import { Bot, Save, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { GetAllEnrichmentConfig } from '@api/commerce/enrichment-config/get-all-enrichment-config-api'
import { SaveEnrichmentConfigApi } from '@api/commerce/enrichment-config/save-enrichment-config-api'

const providers = [
  { value: 'OPENAI', label: 'OpenAI (GPT-4o-mini)', color: '#10a37f' },
  { value: 'CLAUDE', label: 'Claude (Haiku)', color: '#cc785c' },
  { value: 'OLLAMA_LOCAL', label: 'Ollama (Local)', color: '#6b7280' },
]
const modelsByProvider: Record<string, string[]> = {
  OPENAI: ['gpt-4o-mini', 'gpt-4o'],
  CLAUDE: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6-20250514'],
  OLLAMA_LOCAL: ['llama3.3:8b', 'qwen3.5:7b'],
}

export default function EnrichmentConfigPage() {
  const [form, setForm] = useState({ provider: 'OPENAI', apiKey: '', model: 'gpt-4o-mini', monthlyBudget: '10', active: true })
  const [configId, setConfigId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState('')
  const [spend, setSpend] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllEnrichmentConfig({ page: 0, size: 1 })
      if (res?.correct && res.object?.list?.length > 0) {
        const c = res.object.list[0]
        setConfigId(c.id)
        setForm({ provider: c.provider || 'OPENAI', apiKey: c.apiKey || '', model: c.model || 'gpt-4o-mini', monthlyBudget: c.monthlyBudget?.toString() || '10', active: c.active !== false })
        setSpend(c.currentMonthSpend || 0)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await SaveEnrichmentConfigApi({ ...(configId ? { id: configId } : {}), idCompany: 1, idSubsidiary: 1, idModifiedBy: 1, provider: form.provider, apiKey: form.apiKey, model: form.model, monthlyBudget: parseFloat(form.monthlyBudget) || 10, active: form.active })
      if (res?.correct) { setSnack('Configuracion guardada'); fetchData() }
      else setSnack(res?.message || 'Error')
    } catch { setSnack('Error al guardar') }
    setSaving(false)
  }

  const budgetPercent = parseFloat(form.monthlyBudget) > 0 ? (spend / parseFloat(form.monthlyBudget)) * 100 : 0
  const prov = providers.find(p => p.value === form.provider)

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>Configuracion de IA</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>Configura el proveedor de inteligencia artificial para enriquecer productos</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={56} sx={{ borderRadius: 3 }} />)}</Box>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', mb: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Sparkles size={20} color={prov?.color || '#0071e3'} />
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Presupuesto mensual</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: 28, fontWeight: 700 }}>${spend.toFixed(2)}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>/ ${form.monthlyBudget} USD</Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', borderRadius: 3, width: `${Math.min(budgetPercent, 100)}%`, bgcolor: budgetPercent > 80 ? '#ef4444' : budgetPercent > 50 ? '#f59e0b' : '#10b981', transition: 'width 0.5s' }} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Proveedor" select value={form.provider} onChange={e => setForm(p => ({ ...p, provider: e.target.value, model: modelsByProvider[e.target.value]?.[0] || '' }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              {providers.map(p => <MenuItem key={p.value} value={p.value}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Bot size={16} color={p.color} /> {p.label}</Box></MenuItem>)}
            </TextField>
            <TextField label="Modelo" select value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              {(modelsByProvider[form.provider] || []).map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
            <TextField label="API Key" type="password" value={form.apiKey} onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))} fullWidth size="small" placeholder="sk-..." helperText="Clave de API del proveedor" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Presupuesto mensual (USD)" type="number" value={form.monthlyBudget} onChange={e => setForm(p => ({ ...p, monthlyBudget: e.target.value }))} fullWidth size="small" helperText="Limite de gasto mensual en IA" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Chip label={form.active ? 'Activo' : 'Inactivo'} onClick={() => setForm(p => ({ ...p, active: !p.active }))} sx={{ borderRadius: 99, fontWeight: 500, bgcolor: form.active ? '#10b98120' : '#9ca3af20', color: form.active ? '#059669' : '#6b7280', cursor: 'pointer', alignSelf: 'flex-start' }} />
            <Button onClick={handleSave} disabled={saving || !form.apiKey.trim()} sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, textTransform: 'none', fontWeight: 600, py: 1.5, '&:hover': { bgcolor: '#0077ED' }, '&:disabled': { bgcolor: '#ccc', color: '#999' } }} startIcon={<Save size={18} />}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Box>
        </motion.div>
      )}
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  )
}
