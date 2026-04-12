'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, Chip, InputAdornment, Skeleton, TextField, Typography } from '@mui/material'
import { Search, Package, Send, CheckCircle, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

import { GetAllSourceProduct } from '@api/acquisition/source-product/get-all-source-product-api'
import { getKeyApi } from '@utils/utilities'
import { getApiUrl } from '@api/env'

interface SourceProduct { id: number; title: string; price: number; sourceName: string; category: string; imported: boolean }

type FilterType = 'ALL' | 'NOT_IMPORTED' | 'IMPORTED'

export default function SourcesSearchPage() {
  const [products, setProducts] = useState<SourceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [sentIds, setSentIds] = useState<Set<number>>(new Set())
  const [sendingId, setSendingId] = useState<number | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { page: 0, size: 50, active: true }
      if (query.trim()) params.title = query.trim()
      if (filter === 'IMPORTED') params.imported = true
      if (filter === 'NOT_IMPORTED') params.imported = false
      const res = await GetAllSourceProduct(params)
      if (res?.correct) setProducts(res.object?.list ?? [])
    } catch { /* graceful */ }
    setLoading(false)
  }, [query, filter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const sendToCommerce = async (productId: number) => {
    setSendingId(productId)
    try {
      const token = getKeyApi()
      const res = await fetch(
        `${getApiUrl()}/ACQUISITION-SERVICE/vn-api/v2/send-to-commerce/single`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' }, body: JSON.stringify({ sourceProductId: productId }) }
      )
      const data = await res.json()
      if (data.correct) setSentIds(prev => new Set(prev).add(productId))
    } catch { /* silent */ }
    setSendingId(null)
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'ALL', label: 'Todos' },
    { key: 'NOT_IMPORTED', label: 'Sin importar' },
    { key: 'IMPORTED', label: 'Importados' },
  ]

  const card = { bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      {/* Hero search */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: { xs: 26, md: 36 }, fontWeight: 700, letterSpacing: '-0.02em' }}>Buscar Productos</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5, mb: 3 }}>Explora productos de tus proveedores y envialos al catalogo</Typography>

          <TextField fullWidth placeholder="Buscar productos en proveedores..." value={query} onChange={e => setQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={20} color="#9ca3af" /></InputAdornment>,
            }}
            sx={{ maxWidth: 600, mx: 'auto', '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: 'background.paper', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontSize: 15, px: 1, '& fieldset': { borderColor: 'divider' }, '&:hover fieldset': { borderColor: '#0071e3' }, '&.Mui-focused fieldset': { borderColor: '#0071e3' } } }}
          />
        </Box>
      </motion.div>

      {/* Filter chips */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
        {filters.map(f => (
          <Chip key={f.key} label={f.label} onClick={() => setFilter(f.key)}
            sx={{ borderRadius: 99, fontWeight: 600, fontSize: 12, cursor: 'pointer', px: 1, bgcolor: filter === f.key ? '#0071e3' : 'action.hover', color: filter === f.key ? '#fff' : 'text.primary', '&:hover': { bgcolor: filter === f.key ? '#005bb5' : 'action.selected' } }}
          />
        ))}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="rounded" height={140} sx={{ borderRadius: 4 }} />)}
        </Box>
      )}

      {/* Empty */}
      {!loading && products.length === 0 && (
        <Box sx={{ ...card, p: 5, textAlign: 'center' }}>
          <Package size={40} color="#ccc" />
          <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>No se encontraron productos. Intenta con otra busqueda.</Typography>
        </Box>
      )}

      {/* Results grid */}
      {!loading && products.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {products.map((p, i) => {
            const wasSent = sentIds.has(p.id)
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Box sx={{ ...card, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', transition: 'all 0.2s', '&:hover': { boxShadow: '0 2px 10px rgba(0,0,0,0.07)' } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.4, flex: 1, mr: 1 }}>
                      {p.title?.length > 60 ? p.title.substring(0, 60) + '...' : p.title}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0071e3', whiteSpace: 'nowrap' }}>${p.price?.toFixed(2) ?? '0.00'}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {p.sourceName && <Chip icon={<Tag size={11} />} label={p.sourceName} size="small" sx={{ borderRadius: 99, fontSize: 10, fontWeight: 500, bgcolor: '#6366f118', color: '#6366f1', '& .MuiChip-icon': { color: '#6366f1' } }} />}
                    {p.category && <Chip label={p.category} size="small" sx={{ borderRadius: 99, fontSize: 10, fontWeight: 500 }} />}
                    {p.imported && <Chip label="Importado" size="small" sx={{ borderRadius: 99, fontSize: 10, fontWeight: 500, bgcolor: '#10b98118', color: '#059669' }} />}
                  </Box>

                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    {wasSent ? (
                      <Chip icon={<CheckCircle size={13} />} label="Enviado" size="small" sx={{ borderRadius: 99, fontSize: 11, fontWeight: 600, bgcolor: '#10b98118', color: '#059669', '& .MuiChip-icon': { color: '#059669' } }} />
                    ) : (
                      <Button size="small" variant="contained" startIcon={<Send size={13} />} disabled={sendingId === p.id}
                        onClick={() => sendToCommerce(p.id)}
                        sx={{ borderRadius: 99, textTransform: 'none', fontSize: 12, fontWeight: 600, bgcolor: '#0071e3', px: 2, '&:hover': { bgcolor: '#005bb5' } }}>
                        {sendingId === p.id ? 'Enviando...' : 'Enviar a Commerce'}
                      </Button>
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
