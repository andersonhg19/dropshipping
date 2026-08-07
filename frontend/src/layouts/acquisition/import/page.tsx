'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  Alert, Box, Button, Chip, LinearProgress, MenuItem, Select, Skeleton,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material'
import { CheckCircle, FileSpreadsheet, Upload, XCircle, Clock, ArrowRight, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

import Breadcrumbs from '@components/atoms/breadcrumbs'
import { GetAllImportJob } from '@api/acquisition/import-job/get-all-import-job-api'
import { getKeyApi } from '@utils/utilities'

/* ---------------------------------------------------------------------------
 * Campos destino que entiende el backend.
 * Fuente: FileImportService.buildSourceProduct(). Si cambian alli, cambian aqui.
 * ------------------------------------------------------------------------ */
const TARGET_FIELDS = [
  { value: '', label: 'No importar', hint: '' },
  { value: 'title', label: 'Titulo', hint: 'Obligatorio', required: true },
  { value: 'description', label: 'Descripcion', hint: '' },
  { value: 'price', label: 'Precio', hint: 'Numerico' },
  { value: 'currency', label: 'Moneda', hint: 'COP, USD...' },
  { value: 'category', label: 'Categoria', hint: '' },
  { value: 'images', label: 'Imagenes', hint: 'URLs separadas por coma' },
  { value: 'sourceUrl', label: 'URL de origen', hint: '' },
  { value: 'supplierName', label: 'Proveedor', hint: '' },
  { value: 'tags', label: 'Etiquetas', hint: 'Separadas por coma' },
  { value: 'variant_sizes', label: 'Tallas', hint: 'Separadas por coma' },
  { value: 'variant_colors', label: 'Colores', hint: 'Separados por coma' },
] as const

/**
 * Adivina el campo destino a partir del nombre de la columna.
 * Ahorra la mayoria de los clics: un CSV tipico se auto-mapea entero.
 */
function guessField(column: string): string {
  const c = column.toLowerCase().replace(/[\s_-]/g, '')
  const rules: Array<[RegExp, string]> = [
    [/^(titulo|title|nombre|name|producto|product)$/, 'title'],
    [/^(descripcion|description|desc|detalle)$/, 'description'],
    [/^(precio|price|valor|cost|costo)$/, 'price'],
    [/^(moneda|currency|divisa)$/, 'currency'],
    [/^(categoria|category|cat)$/, 'category'],
    [/^(imagen|imagenes|image|images|foto|fotos|img)$/, 'images'],
    [/^(url|link|enlace|sourceurl)$/, 'sourceUrl'],
    [/^(proveedor|supplier|suppliername|marca|brand)$/, 'supplierName'],
    [/^(tags|etiquetas|keywords)$/, 'tags'],
    [/^(talla|tallas|size|sizes)$/, 'variant_sizes'],
    [/^(color|colores|colors)$/, 'variant_colors'],
  ]
  for (const [re, field] of rules) if (re.test(c)) return field
  return ''
}

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

/** Envoltorio estandar de respuesta del backend (ResultDTO). */
interface ApiResult<T = any> {
  correct: boolean
  message?: string
  errorCode?: number
  object?: T | null
}

/** fetch().json() devuelve `unknown`: se acota aqui una sola vez. */
async function readResult<T = any>(resp: Response): Promise<ApiResult<T>> {
  const data = (await resp.json()) as unknown
  if (data && typeof data === 'object' && 'correct' in data) {
    return data as ApiResult<T>
  }
  return { correct: false, message: `Respuesta inesperada del servidor (HTTP ${resp.status}).` }
}

interface StatusStyle { color: string; bg: string; icon: any; label: string }

const DEFAULT_STATUS: StatusStyle = { color: '#d97706', bg: '#f59e0b15', icon: Upload, label: 'Subido' }

const statusConfig: Record<string, StatusStyle> = {
  COMPLETED: { color: '#059669', bg: '#10b98115', icon: CheckCircle, label: 'Completado' },
  COMPLETED_WITH_ERRORS: { color: '#d97706', bg: '#f59e0b15', icon: CheckCircle, label: 'Con errores' },
  FAILED: { color: '#dc2626', bg: '#ef444415', icon: XCircle, label: 'Fallido' },
  PROCESSING: { color: '#2563eb', bg: '#3b82f615', icon: Clock, label: 'Procesando...' },
  IMPORTING: { color: '#2563eb', bg: '#3b82f615', icon: Clock, label: 'Importando...' },
  UPLOADED: { color: '#d97706', bg: '#f59e0b15', icon: Upload, label: 'Subido' },
  MAPPED: { color: '#7c3aed', bg: '#8b5cf615', icon: FileSpreadsheet, label: 'Mapeado' },
}

type Step = 'upload' | 'map' | 'done'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const API = `${BASE_URL}/ACQUISITION-SERVICE/vn-api/v2/file-import`

export default function ImportLayoutForm() {
  const [jobs, setJobs] = useState<ImportJobItem[]>([])
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>('upload')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // El File se conserva: preview y execute vuelven a enviarlo al backend.
  const fileRef = useRef<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [columns, setColumns] = useState<string[]>([])
  const [totalRows, setTotalRows] = useState<number | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState<Array<Record<string, string>> | null>(null)
  const [result, setResult] = useState<any>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllImportJob({ page: 0, size: 50 })
      if (res?.correct) setJobs(res.object?.list ?? [])
    } catch {
      /* el historial es secundario: no se bloquea la pantalla si falla */
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /* El backend exige que 'titulo' este mapeado. Se valida aqui para no
     gastar una llamada y para poder explicarlo antes. */
  const hasTitle = useMemo(
    () => Object.values(mapping).some((v) => v === 'title'),
    [mapping],
  )

  const mappedCount = useMemo(
    () => Object.values(mapping).filter(Boolean).length,
    [mapping],
  )

  /* Un mismo campo destino asignado a dos columnas: la ultima gana en
     silencio y el usuario no se entera. Se avisa. */
  const duplicates = useMemo(() => {
    const seen = new Map<string, number>()
    Object.values(mapping).filter(Boolean).forEach((v) => seen.set(v, (seen.get(v) ?? 0) + 1))
    return [...seen.entries()].filter(([, n]) => n > 1).map(([v]) => v)
  }, [mapping])

  async function authHeaders() {
    const token = await getKeyApi()
    return { Authorization: `Bearer ${token}`, lng: 'es' }
  }

  /* --------------------------------------------------------------------- */
  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const resp = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: await authHeaders(),
        body: formData,
      })
      const data = await readResult<{ columns?: string[]; totalRows?: number }>(resp)

      if (!data.correct) {
        setError(data.message || 'No se pudo leer el archivo.')
        return
      }

      const cols: string[] = data.object?.columns ?? []
      fileRef.current = file
      setFileName(file.name)
      setColumns(cols)
      setTotalRows(data.object?.totalRows ?? null)

      // Auto-mapeo por nombre de columna.
      const guessed: Record<string, string> = {}
      const used = new Set<string>()
      cols.forEach((c) => {
        const g = guessField(c)
        if (g && !used.has(g)) { guessed[c] = g; used.add(g) }
        else guessed[c] = ''
      })
      setMapping(guessed)
      setPreview(null)
      setStep('map')
      fetchData()
    } catch (err) {
      setError('Error al subir: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  /** Mapeo en el formato que espera el backend: { columnaOrigen: campoDestino } */
  function mappingPayload(): string {
    const clean: Record<string, string> = {}
    Object.entries(mapping).forEach(([col, field]) => { if (field) clean[col] = field })
    return JSON.stringify(clean)
  }

  async function handlePreview() {
    if (!fileRef.current) return
    setError(null)
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', fileRef.current)
      formData.append('fieldMapping', mappingPayload())

      const resp = await fetch(`${API}/preview`, {
        method: 'POST',
        headers: await authHeaders(),
        body: formData,
      })
      const data = await readResult<{ mappedRows?: Array<Record<string, string>>; rowCount?: number }>(resp)

      if (!data.correct) { setError(data.message || 'No se pudo generar la vista previa.'); return }
      setPreview(data.object?.mappedRows ?? [])
      setTotalRows(data.object?.rowCount ?? totalRows)
    } catch (err) {
      setError('Error en la vista previa: ' + (err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleExecute() {
    if (!fileRef.current) return
    setError(null)
    setBusy(true)
    try {
      const formData = new FormData()
      formData.append('file', fileRef.current)
      formData.append('fieldMapping', mappingPayload())

      const resp = await fetch(`${API}/execute`, {
        method: 'POST',
        headers: await authHeaders(),
        body: formData,
      })
      const data = await readResult(resp)

      if (!data.correct) { setError(data.message || 'La importacion fallo.'); return }
      setResult(data.object)
      setStep('done')
      fetchData()
    } catch (err) {
      setError('Error al importar: ' + (err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    fileRef.current = null
    setFileName(''); setColumns([]); setMapping({}); setPreview(null)
    setResult(null); setError(null); setTotalRows(null); setStep('upload')
  }

  /* --------------------------------------------------------------------- */
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Breadcrumbs />

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Importar Productos
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>
          Sube un CSV, Excel o JSON, empareja las columnas y confirma.
        </Typography>
      </Box>

      {/* Pasos */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
        {([['upload', '1. Subir archivo'], ['map', '2. Emparejar campos'], ['done', '3. Resultado']] as const)
          .map(([key, label], i) => {
            const order: Step[] = ['upload', 'map', 'done']
            const active = step === key
            const done = order.indexOf(step) > order.indexOf(key as Step)
            return (
              <React.Fragment key={key}>
                {i > 0 && <Box sx={{ flex: '0 0 24px', height: '1px', bgcolor: 'divider' }} />}
                <Chip
                  label={label}
                  size="small"
                  sx={{
                    fontWeight: active ? 700 : 500,
                    bgcolor: active ? '#0071e3' : done ? '#10b98115' : 'action.hover',
                    color: active ? '#fff' : done ? '#059669' : 'text.secondary',
                  }}
                />
              </React.Fragment>
            )
          })}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ============================ PASO 1 ============================ */}
      {step === 'upload' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box
            role="button"
            tabIndex={0}
            aria-label="Subir archivo CSV, Excel o JSON"
            sx={{
              border: '2px dashed', borderColor: 'divider', borderRadius: 4, p: 5, textAlign: 'center',
              bgcolor: 'action.hover', mb: 4, cursor: 'pointer', transition: 'all 0.2s',
              '&:hover': { borderColor: '#0071e3', bgcolor: '#0071e308' },
              '&:focus-visible': { outline: '2px solid #0071e3', outlineOffset: '2px' },
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).click()
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const f = e.dataTransfer.files?.[0]
              if (f) handleFile(f)
            }}
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.csv,.xlsx,.json'
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0]
                if (f) handleFile(f)
              }
              input.click()
            }}
          >
            <Upload size={40} color="#9ca3af" aria-hidden="true" />
            <Typography sx={{ mt: 2, fontWeight: 600 }}>
              {uploading ? 'Leyendo archivo...' : 'Arrastra un archivo o haz clic para seleccionar'}
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, color: 'text.secondary' }}>
              CSV, Excel (.xlsx) o JSON &middot; maximo 5.000 filas
            </Typography>
            {uploading && <LinearProgress sx={{ mt: 3, borderRadius: 2 }} />}
          </Box>
        </motion.div>
      )}

      {/* ============================ PASO 2 ============================ */}
      {step === 'map' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{fileName}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {columns.length} columnas
                  {totalRows != null && ` · ${totalRows.toLocaleString('es-CO')} filas`}
                  {` · ${mappedCount} emparejadas`}
                </Typography>
              </Box>
              <Button size="small" startIcon={<RotateCcw size={15} />} onClick={reset}>
                Cambiar archivo
              </Button>
            </Box>
          </Box>

          {!hasTitle && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Empareja una columna con <strong>Titulo</strong>. Es el unico campo obligatorio:
              sin el, el producto no se puede crear.
            </Alert>
          )}

          {duplicates.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Hay campos asignados a mas de una columna
              ({duplicates.join(', ')}). Solo se guardara uno de los valores.
            </Alert>
          )}

          <Box sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>COLUMNA DEL ARCHIVO</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12, width: 260 }}>CAMPO EN VISNEX</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{col}</TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={mapping[col] ?? ''}
                        onChange={(e) => setMapping({ ...mapping, [col]: e.target.value as string })}
                        sx={{ borderRadius: 2, fontSize: 13 }}
                        inputProps={{ 'aria-label': `Campo destino para la columna ${col}` }}
                      >
                        {TARGET_FIELDS.map((f) => (
                          <MenuItem key={f.value} value={f.value} sx={{ fontSize: 13 }}>
                            {f.label}
                            {f.hint && (
                              <Typography component="span" sx={{ ml: 1, fontSize: 11, color: 'text.disabled' }}>
                                {f.hint}
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
            <Button variant="outlined" onClick={handlePreview} disabled={!hasTitle || busy}
              sx={{ borderRadius: 999, textTransform: 'none' }}>
              Ver vista previa
            </Button>
            <Button variant="contained" onClick={handleExecute} disabled={!hasTitle || busy}
              endIcon={<ArrowRight size={16} />}
              sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#0071e3' }}>
              {busy ? 'Importando...' : `Importar ${totalRows ?? ''} productos`}
            </Button>
          </Box>

          {busy && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

          {preview && (
            <Box sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'auto', mb: 4 }}>
              <Typography sx={{ p: 2, fontWeight: 600, fontSize: 14, borderBottom: '1px solid', borderColor: 'divider' }}>
                Vista previa &mdash; primeras {preview.length} filas ya emparejadas
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    {Object.keys(preview[0] ?? {}).map((k) => (
                      <TableCell key={k} sx={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{k}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i}>
                      {Object.keys(preview[0] ?? {}).map((k) => (
                        <TableCell key={k} sx={{ fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row[k] || <span style={{ color: '#bbb' }}>&mdash;</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </motion.div>
      )}

      {/* ============================ PASO 3 ============================ */}
      {step === 'done' && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3, textAlign: 'center' }}>
            <CheckCircle size={44} color="#059669" aria-hidden="true" />
            <Typography sx={{ mt: 2, fontSize: 20, fontWeight: 700 }}>Importacion terminada</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>{result.fileName}</Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              {[
                ['Importados', result.successCount, '#059669'],
                ['Omitidos (ya existian)', result.warningCount, '#d97706'],
                ['Con error', result.errorCount, '#dc2626'],
                ['Total en el archivo', result.totalRows, 'inherit'],
              ].map(([label, value, color]) => (
                <Box key={label as string} sx={{ minWidth: 110 }}>
                  <Typography sx={{ fontSize: 28, fontWeight: 700, color: color as string }}>
                    {(value as number) ?? 0}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label as string}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4, flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={reset} sx={{ borderRadius: 999, textTransform: 'none' }}>
                Importar otro archivo
              </Button>
              <Button variant="contained" href="/dashboard/products/list"
                sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#0071e3' }}>
                Ver productos
              </Button>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* ========================= HISTORIAL ========================= */}
      <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2, mt: 5 }}>
        Historial de importaciones
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
          <Typography sx={{ fontSize: 14 }}>Aun no has importado ningun archivo.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {jobs.map((job) => {
            const cfg: StatusStyle = statusConfig[job.status] ?? DEFAULT_STATUS
            const Icon = cfg.icon
            const pct = job.totalRows > 0 ? Math.round((job.successCount / job.totalRows) * 100) : 0
            return (
              <Box key={job.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: cfg.bg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={cfg.color} aria-hidden="true" />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{job.fileName}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                      {job.successCount} importados &middot; {job.warningCount} omitidos &middot; {job.errorCount} con error
                      {job.totalRows ? ` · de ${job.totalRows}` : ''}
                    </Typography>
                  </Box>
                  <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11 }} />
                </Box>
                {job.totalRows > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    aria-label={`Progreso de ${job.fileName}: ${pct}%`}
                    sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: 'action.disabledBackground' }}
                  />
                )}
              </Box>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
