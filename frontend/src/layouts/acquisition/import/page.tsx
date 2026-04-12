'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Box, Button, Chip, LinearProgress, Skeleton, Typography } from '@mui/material'
import { CheckCircle, FileSpreadsheet, Upload, XCircle, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { GetAllImportJob } from '@api/acquisition/import-job/get-all-import-job-api'

interface ImportJobItem {
  id: number
  fileName: string
  fileType: string
  status: string
  totalRows: number
  successCount: number
  errorCount: number
  warningCount: number
  creation: string
}

const statusConfig: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  COMPLETED: { color: '#059669', bg: '#10b98115', icon: CheckCircle, label: 'Completado' },
  FAILED: { color: '#dc2626', bg: '#ef444415', icon: XCircle, label: 'Fallido' },
  IMPORTING: { color: '#2563eb', bg: '#3b82f615', icon: Clock, label: 'Importando...' },
  UPLOADED: { color: '#d97706', bg: '#f59e0b15', icon: Upload, label: 'Subido' },
  MAPPED: { color: '#7c3aed', bg: '#8b5cf615', icon: FileSpreadsheet, label: 'Mapeado' },
}

export default function ImportLayoutForm() {
  const [jobs, setJobs] = useState<ImportJobItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllImportJob({ page: 0, size: 50 })
      if (res?.correct) setJobs(res.object?.list ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Importar Productos
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>
          Sube archivos CSV, Excel o JSON con tus productos
        </Typography>
      </Box>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{
          border: '2px dashed #d1d5db', borderRadius: 4, p: 5, textAlign: 'center',
          bgcolor: '#fafafa', mb: 4, cursor: 'pointer', transition: 'all 0.2s',
          '&:hover': { borderColor: '#0071e3', bgcolor: '#0071e308' },
        }}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.csv,.xlsx,.json'
          input.onchange = () => {
            // TODO: integrate with file-import API
            alert('Funcionalidad de upload sera conectada al backend en la siguiente iteracion')
          }
          input.click()
        }}>
          <Upload size={40} color="#9ca3af" />
          <Typography sx={{ mt: 2, fontWeight: 600, color: 'text.primary' }}>
            Arrastra un archivo o haz clic para seleccionar
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
            Formatos soportados: CSV, Excel (.xlsx), JSON
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: 12, color: 'text.disabled' }}>
            Maximo 5,000 filas por archivo
          </Typography>
        </Box>
      </motion.div>

      {/* Import history */}
      <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>
        Historial de importaciones
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <FileSpreadsheet size={40} color="#ccc" />
          <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>
            No hay importaciones. Sube tu primer archivo.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {jobs.map((job, i) => {
            const cfg = statusConfig[job.status] || statusConfig.UPLOADED
            const StatusIcon = cfg.icon
            const successRate = job.totalRows > 0 ? (job.successCount / job.totalRows) * 100 : 0

            return (
              <motion.div key={job.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Box sx={{
                  p: 2.5, borderRadius: 3, bgcolor: 'background.paper',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StatusIcon size={18} color={cfg.color} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{job.fileName}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                          {job.fileType} &middot; {job.totalRows} filas
                        </Typography>
                      </Box>
                    </Box>
                    <Chip label={cfg.label} size="small" sx={{ borderRadius: 99, fontWeight: 500, fontSize: 11, bgcolor: cfg.bg, color: cfg.color }} />
                  </Box>

                  {job.status === 'COMPLETED' && (
                    <>
                      <LinearProgress variant="determinate" value={successRate}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f1f1',
                          '& .MuiLinearProgress-bar': { bgcolor: job.errorCount > 0 ? '#f59e0b' : '#10b981', borderRadius: 3 } }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography sx={{ fontSize: 12, color: '#059669' }}>
                          {job.successCount} exitosos
                        </Typography>
                        {job.errorCount > 0 && (
                          <Typography sx={{ fontSize: 12, color: '#dc2626' }}>
                            {job.errorCount} errores
                          </Typography>
                        )}
                        {job.warningCount > 0 && (
                          <Typography sx={{ fontSize: 12, color: '#d97706' }}>
                            {job.warningCount} duplicados
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              </motion.div>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
