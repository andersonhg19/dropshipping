'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Box, Button, Chip, IconButton, Skeleton, Snackbar, Tab, Tabs,
  TextField, Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, Clock, ExternalLink, Globe, Image, Info,
  RefreshCw, Save, Sparkles, Upload,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { getKeyApi } from '@utils/utilities'

import { BASE_URL_COMMERCE_PRODUCT } from '@api/api-path'
import { RawFetchData } from '@api/raw-fetch-data'
import { GenericSaveResponse } from '@api/generic-response'

const APPLE_BLUE = '#0071e3'
const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9CA3AF', READY: '#3B82F6', ENRICHED: '#8B5CF6',
  PUBLISHED: '#10B981', ARCHIVED: '#EF4444',
}
const MotionBox = motion.create(Box)

const sxCard = {
  bgcolor: 'background.paper', borderRadius: '16px', p: 3,
  boxShadow: '0 1px 3px rgba(0,0,0,.08)',
}
const sxPill = (bg: string, hover: string) => ({
  bgcolor: bg, color: '#fff', borderRadius: '999px', textTransform: 'none' as const,
  fontWeight: 600, px: 3, py: 1, '&:hover': { bgcolor: hover },
})

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { cardBgColor } = usePaletteVars()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [snack, setSnack] = useState('')

  // Editable fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState(0)
  const [costPrice, setCostPrice] = useState(0)
  const [sellingPrice, setSellingPrice] = useState(0)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')

  const margin = sellingPrice > 0 && costPrice > 0
    ? (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1)
    : '0.0'

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getKeyApi()
      const opts: RequestInit = {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, lng: 'es',
        },
      }
      const data = await RawFetchData<GenericSaveResponse>(
        BASE_URL_COMMERCE_PRODUCT, `get/${productId}`, opts,
      )
      if (data.correct && data.object) {
        const p = data.object
        setProduct(p)
        setTitle(p.title || '')
        setDescription(p.description || '')
        setBasePrice(p.basePrice || 0)
        setCostPrice(p.costPrice || 0)
        setSellingPrice(p.sellingPrice || 0)
        setTags(p.tags ? p.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [])
        setSeoTitle(p.seoTitle || '')
        setSeoDescription(p.seoDescription || '')
        setSeoKeywords(p.seoKeywords || '')
      }
    } catch { setSnack('Error al cargar producto') }
    finally { setLoading(false) }
  }, [productId])

  useEffect(() => { fetchProduct() }, [fetchProduct])

  const handleSave = async () => {
    try {
      const token = await getKeyApi()
      const body = {
        ...product, title, description, basePrice, costPrice, sellingPrice,
        tags: tags.join(', '), seoTitle, seoDescription, seoKeywords,
      }
      const opts: RequestInit = {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, lng: 'es',
        }, body: JSON.stringify(body),
      }
      const data = await RawFetchData<GenericSaveResponse>(
        BASE_URL_COMMERCE_PRODUCT, 'save', opts,
      )
      if (data.correct) {
        setSnack('Producto guardado')
        fetchProduct()
      } else { setSnack(data.message || 'Error al guardar') }
    } catch { setSnack('Error de conexion') }
  }

  const handleEnrich = async () => {
    try {
      const token = await getKeyApi()
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${BASE_URL}/COMMERCE-SERVICE/vn-api/v2/ai-enrichment/enrich`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' },
        body: JSON.stringify({ productId: Number(productId), idCompany: 1 }),
      })
      const data = await res.json()
      if (data.correct) { setSnack('Producto enriquecido con IA'); fetchProduct() }
      else setSnack(data.message || 'Error al enriquecer')
    } catch { setSnack('Error de conexion al enriquecer') }
  }

  const handlePublish = async (channelId: number) => {
    try {
      const token = await getKeyApi()
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${BASE_URL}/COMMERCE-SERVICE/vn-api/v2/woocommerce/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' },
        body: JSON.stringify({ productId: Number(productId), channelId }),
      })
      const data = await res.json()
      if (data.correct) { setSnack('Publicado correctamente'); fetchProduct() }
      else setSnack(data.message || 'Error al publicar')
    } catch { setSnack('Error de conexion') }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const statusBadge = (s: string) => (
    <Chip label={s} size="small" sx={{ bgcolor: `${STATUS_COLORS[s] || '#9CA3AF'}18`,
      color: STATUS_COLORS[s] || '#9CA3AF', fontWeight: 700, fontSize: 12, borderRadius: '8px' }} />
  )
  const PUB_COLORS: Record<string, string> = { SYNCED: '#10B981', PENDING: '#F59E0B', FAILED: '#EF4444', NOT_PUBLISHED: '#9CA3AF' }
  const pubStatusChip = (s: string) => (
    <Chip label={s} size="small" sx={{ bgcolor: `${PUB_COLORS[s] || '#9CA3AF'}18`,
      color: PUB_COLORS[s] || '#9CA3AF', fontWeight: 600, fontSize: 11, borderRadius: '8px' }} />
  )

  if (loading) return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, py: 5 }}>
      <Skeleton variant="rounded" height={48} sx={{ borderRadius: '16px', mb: 3 }} />
      <Skeleton variant="rounded" height={400} sx={{ borderRadius: '16px' }} />
    </Box>
  )

  const images: string[] = product?.imageUrls
    ? (typeof product.imageUrls === 'string' ? JSON.parse(product.imageUrls) : product.imageUrls)
    : []

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <IconButton onClick={() => router.push('/dashboard/products/list')}
          sx={{ bgcolor: cardBgColor || 'action.hover', borderRadius: '12px' }}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: { xs: 24, md: 30 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {product?.title || 'Producto'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            ID: {productId}
          </Typography>
        </Box>
        {product?.status && statusBadge(product.status)}
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{
        mb: 3, mt: 2, '& .MuiTab-root': {
          textTransform: 'none', fontWeight: 600, fontSize: 14, minHeight: 40,
        }, '& .MuiTabs-indicator': { bgcolor: APPLE_BLUE, borderRadius: 2, height: 3 },
      }}>
        <Tab icon={<Info size={16} />} iconPosition="start" label="General" />
        <Tab icon={<Image size={16} />} iconPosition="start" label="Imagenes" />
        <Tab icon={<Globe size={16} />} iconPosition="start" label="SEO" />
        <Tab icon={<Upload size={16} />} iconPosition="start" label="Publicacion" />
        <Tab icon={<Clock size={16} />} iconPosition="start" label="Historial" />
      </Tabs>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <MotionBox key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>

          {/* Tab 0: General */}
          {tab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={sxCard}>
                <TextField label="Titulo" value={title} onChange={(e) => setTitle(e.target.value)}
                  fullWidth size="small" sx={{ mb: 2.5 }} />
                {product?.enrichedTitle && (
                  <Box sx={{ mb: 2.5, p: 2, bgcolor: '#8B5CF610', borderRadius: '12px' }}>
                    <Typography sx={{ fontSize: 12, color: '#8B5CF6', fontWeight: 600, mb: 0.5 }}>Titulo enriquecido (IA)</Typography>
                    <Typography sx={{ fontSize: 14 }}>{product.enrichedTitle}</Typography>
                  </Box>)}
                <TextField label="Descripcion" value={description} onChange={(e) => setDescription(e.target.value)}
                  multiline rows={3} fullWidth size="small" sx={{ mb: 2.5 }} />
                {product?.enrichedDescription && (
                  <Box sx={{ mb: 2.5, p: 2, bgcolor: '#8B5CF610', borderRadius: '12px' }}>
                    <Typography sx={{ fontSize: 12, color: '#8B5CF6', fontWeight: 600, mb: 0.5 }}>Descripcion enriquecida (IA)</Typography>
                    <Typography sx={{ fontSize: 14 }}>{product.enrichedDescription}</Typography>
                  </Box>)}
                {product?.bulletPoints && (
                  <Box sx={{ mb: 2.5, p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5, color: 'text.secondary' }}>Bullet Points</Typography>
                    <Typography sx={{ fontSize: 14, whiteSpace: 'pre-line' }}>{product.bulletPoints}</Typography>
                  </Box>)}
                <Button startIcon={<Sparkles size={16} />} onClick={handleEnrich}
                  sx={sxPill('#8B5CF6', '#7C3AED')}>
                  Enriquecer con IA
                </Button>
              </Box>

              <Box sx={sxCard}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField label="Precio base" type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} fullWidth size="small" />
                  <TextField label="Precio costo" type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} fullWidth size="small" />
                  <TextField label="Precio venta" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} fullWidth size="small" />
                </Box>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Margen: <strong style={{ color: Number(margin) > 0 ? '#10B981' : '#EF4444' }}>{margin}%</strong></Typography>
              </Box>

              <Box sx={sxCard}>
                <TextField label="Categoria" value={product?.categoryName || ''} disabled
                  fullWidth size="small" sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  {tags.map((t, i) => (
                    <Chip key={i} label={t} size="small" onDelete={() => setTags(tags.filter((_, j) => j !== i))}
                      sx={{ borderRadius: '8px', fontWeight: 500 }} />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField label="Agregar tag" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    size="small" sx={{ flex: 1 }} />
                  <Button onClick={addTag} sx={{ borderRadius: '12px', textTransform: 'none' }}>Agregar</Button>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button startIcon={<Save size={16} />} onClick={handleSave} sx={sxPill(APPLE_BLUE, '#005ecb')}>
                  Guardar cambios
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 1: Imagenes */}
          {tab === 1 && (
            <Box sx={sxCard}>
              {images.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                  {images.map((url: string, i: number) => (
                    <Box key={i} sx={{
                      borderRadius: '12px', overflow: 'hidden', position: 'relative',
                      bgcolor: 'action.hover', aspectRatio: '1',
                    }}>
                      <img src={url} alt={`Imagen ${i + 1}`} style={{
                        width: '100%', height: '100%', objectFit: 'cover',
                      }} />
                      <TextField placeholder="Texto alternativo" size="small" fullWidth
                        sx={{ position: 'absolute', bottom: 0, bgcolor: 'rgba(255,255,255,.9)', '& fieldset': { border: 'none' } }} />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <Image size={48} strokeWidth={1.2} style={{ marginBottom: 12 }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 600 }}>No hay imagenes</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {['Buscar imagenes libres', 'Subir imagen'].map((label, i) => (
                  <Button key={label} startIcon={i === 0 ? <Globe size={16} /> : <Upload size={16} />}
                    sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600, border: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>
                    {label}
                  </Button>))}
              </Box>
              <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 2 }}>Arrastra para reordenar (proximamente)</Typography>
            </Box>
          )}

          {/* Tab 2: SEO */}
          {tab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={sxCard}>
                <Box sx={{ mb: 2.5 }}>
                  <TextField label="Titulo SEO" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value.slice(0, 60))} fullWidth size="small" />
                  <Typography sx={{ fontSize: 12, color: seoTitle.length > 55 ? '#EF4444' : 'text.disabled', mt: 0.5, textAlign: 'right' }}>{seoTitle.length}/60</Typography>
                </Box>
                <Box sx={{ mb: 2.5 }}>
                  <TextField label="Descripcion SEO" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))} multiline rows={2} fullWidth size="small" />
                  <Typography sx={{ fontSize: 12, color: seoDescription.length > 150 ? '#EF4444' : 'text.disabled', mt: 0.5, textAlign: 'right' }}>{seoDescription.length}/160</Typography>
                </Box>
                <TextField label="Keywords (separadas por coma)" value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  fullWidth size="small" sx={{ mb: 2.5 }} />
                <Button startIcon={<Sparkles size={16} />} onClick={handleEnrich}
                  sx={sxPill('#8B5CF6', '#7C3AED')}>
                  Generar con IA
                </Button>
              </Box>

              {/* Google Preview */}
              <Box sx={{ ...sxCard, border: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 2 }}>Vista previa de Google</Typography>
                <Typography sx={{ fontSize: 18, color: '#1a0dab', fontWeight: 400, mb: 0.3, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  {seoTitle || title || 'Titulo del producto'}</Typography>
                <Typography sx={{ fontSize: 13, color: '#006621', mb: 0.5 }}>
                  {process.env.NEXT_PUBLIC_STORE_URL || 'https://tutienda.com'} {'>'} productos {'>'} ...</Typography>
                <Typography sx={{ fontSize: 13, color: '#545454', lineHeight: 1.5 }}>
                  {seoDescription || description || 'Descripcion del producto aparecera aqui...'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button startIcon={<Save size={16} />} onClick={handleSave} sx={sxPill(APPLE_BLUE, '#005ecb')}>
                  Guardar SEO
                </Button>
              </Box>
            </Box>
          )}

          {/* Tab 3: Publicacion */}
          {tab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(product?.publishStatuses?.length > 0) ? product.publishStatuses.map((ch: any, i: number) => (
                <Box key={i} sx={{ ...sxCard, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: 160 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{ch.channelName || `Canal ${ch.channelId}`}</Typography>
                    {ch.lastSync && <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Ultima sync: {ch.lastSync}</Typography>}
                  </Box>
                  {pubStatusChip(ch.status || 'NOT_PUBLISHED')}
                  <Button size="small" startIcon={<Upload size={14} />} onClick={() => handlePublish(ch.channelId)} sx={sxPill('#10B981', '#059669')}>Publicar</Button>
                  <Button size="small" startIcon={<RefreshCw size={14} />}
                    sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600, border: '1px solid', borderColor: 'divider', color: 'text.secondary' }}>Test Connection</Button>
                </Box>
              )) : (
                <Box sx={{ ...sxCard, textAlign: 'center', py: 6 }}>
                  <ExternalLink size={40} strokeWidth={1.2} style={{ marginBottom: 12, color: '#9CA3AF' }} />
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: 'text.secondary' }}>No hay canales configurados</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: 0.5 }}>Configura canales de publicacion en Ajustes</Typography>
                  <Button startIcon={<Upload size={16} />} onClick={() => handlePublish(1)} sx={{ ...sxPill(APPLE_BLUE, '#005ecb'), mt: 2 }}>Publicar en WooCommerce</Button>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 4: Historial */}
          {tab === 4 && (
            <Box sx={{ ...sxCard, textAlign: 'center', py: 8 }}>
              <Clock size={48} strokeWidth={1.2} style={{ marginBottom: 12, color: '#9CA3AF' }} />
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.secondary' }}>Proximamente</Typography>
              <Typography sx={{ fontSize: 14, color: 'text.disabled', mt: 1 }}>
                El historial de cambios estara disponible en una proxima version.
              </Typography>
            </Box>
          )}
        </MotionBox>
      </AnimatePresence>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '& .MuiSnackbarContent-root': { borderRadius: '12px', fontWeight: 500 } }} />
    </Box>
  )
}
