'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Chip, Skeleton, TextField, Typography } from '@mui/material'
import { ClipboardList, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

import { getKeyApi } from '@utils/utilities'
import { getApiUrl } from '@api/env'

interface AuditLog { id: number; action: string; entityType: string; entityId: number; userName: string; changes: string; creation: string }

const actionConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  CREATE: { color: '#059669', bg: '#10b98118', icon: Plus, label: 'Creacion' },
  UPDATE: { color: '#2563eb', bg: '#3b82f618', icon: Pencil, label: 'Actualizacion' },
  DELETE: { color: '#dc2626', bg: '#ef444418', icon: Trash2, label: 'Eliminacion' },
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const token = getKeyApi()
      if (!token) { setError(true); setLoading(false); return }
      const body: Record<string, any> = { page: 0, size: 50, active: true }
      if (startDate) body.startDate = startDate
      if (endDate) body.endDate = endDate
      const res = await fetch(
        `${getApiUrl()}/AUDIT-SERVICE/vn-api/v2/audit-log/all`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' }, body: JSON.stringify(body) }
      )
      const data = await res.json()
      if (data.correct) setLogs(data.object?.list ?? [])
      else setError(true)
    } catch {
      setError(true)
    }
    setLoading(false)
  }, [startDate, endDate])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  const card = { bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>Registros de Auditoria</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5, mb: 3 }}>Historial de actividades del sistema</Typography>

      {/* Date filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField type="date" size="small" label="Desde" value={startDate} onChange={e => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
          <TextField type="date" size="small" label="Hasta" value={endDate} onChange={e => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }} sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
        </Box>
      </motion.div>

      {/* Error state */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ ...card, p: 4, textAlign: 'center', mb: 3 }}>
            <AlertCircle size={36} color="#9ca3af" />
            <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>Registros no disponibles. Verifica que el servicio de auditoria este activo.</Typography>
          </Box>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3 }} />)}
        </Box>
      )}

      {/* Empty */}
      {!loading && !error && logs.length === 0 && (
        <Box sx={{ ...card, p: 5, textAlign: 'center' }}>
          <ClipboardList size={40} color="#ccc" />
          <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>No se encontraron registros para el rango seleccionado.</Typography>
        </Box>
      )}

      {/* Timeline */}
      {!loading && !error && logs.length > 0 && (
        <Box sx={{ position: 'relative', pl: 4 }}>
          {/* Timeline line */}
          <Box sx={{ position: 'absolute', left: 11, top: 8, bottom: 8, width: 2, bgcolor: 'divider', borderRadius: 1 }} />

          {logs.map((log, i) => {
            const cfg = actionConfig[log.action] || actionConfig.UPDATE
            const Icon = cfg.icon
            return (
              <motion.div key={log.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  {/* Dot */}
                  <Box sx={{ position: 'absolute', left: -28, top: 18, width: 12, height: 12, borderRadius: '50%', bgcolor: cfg.color, border: '2px solid', borderColor: 'background.default', zIndex: 1 }} />

                  <Box sx={{ ...card, p: 2.5, transition: 'all 0.2s', '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={15} color={cfg.color} />
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>{log.entityType} #{log.entityId}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{log.userName || 'Sistema'}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={cfg.label} size="small" sx={{ borderRadius: 99, fontSize: 10, fontWeight: 600, bgcolor: cfg.bg, color: cfg.color }} />
                        <Typography sx={{ fontSize: 11, color: 'text.disabled', whiteSpace: 'nowrap' }}>{formatDate(log.creation)}</Typography>
                      </Box>
                    </Box>
                    {log.changes && (
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1, pl: 5.5, lineHeight: 1.5 }}>
                        {log.changes.length > 150 ? log.changes.substring(0, 150) + '...' : log.changes}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </motion.div>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
