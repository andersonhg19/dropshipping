'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Box, Button, Chip, Skeleton, Typography } from '@mui/material'
import { Globe, CheckCircle, XCircle, AlertTriangle, ExternalLink, Send } from 'lucide-react'
import { motion } from 'framer-motion'

import { GetAllPublishChannel } from '@api/commerce/publish-channel/get-all-publish-channel-api'
import { GetAllProduct } from '@api/commerce/product/get-all-product-api'
import { getKeyApi } from '@utils/utilities'
import { getApiUrl } from '@api/env'

interface Channel { id: number; name: string; type: string; baseUrl: string; status: string; active: boolean }
interface Product { id: number; title: string; price: number; status: string; wpPermalink: string; syncStatus: string }

const statusChip: Record<string, { color: string; bg: string; icon: any }> = {
  CONNECTED:    { color: '#059669', bg: '#10b98118', icon: CheckCircle },
  DISCONNECTED: { color: '#9ca3af', bg: '#9ca3af15', icon: XCircle },
  ERROR:        { color: '#dc2626', bg: '#ef444418', icon: AlertTriangle },
}

export default function PublishWordPressPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<number | null>(null)
  const [connStatus, setConnStatus] = useState<Record<number, string>>({})
  const [publishing, setPublishing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [chRes, prRes] = await Promise.all([
        GetAllPublishChannel({ type: 'WOOCOMMERCE', page: 0, size: 50 }),
        GetAllProduct({ status: 'PUBLISHED', page: 0, size: 50 }),
      ])
      if (chRes?.correct) setChannels(chRes.object?.list ?? [])
      if (prRes?.correct) setProducts(prRes.object?.list ?? [])
    } catch { /* handled gracefully */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const testConnection = async (channelId: number) => {
    setTesting(channelId)
    try {
      const token = getKeyApi()
      const res = await fetch(
        `${getApiUrl()}/COMMERCE-SERVICE/vn-api/v2/woocommerce/test-connection`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' }, body: JSON.stringify({ channelId }) }
      )
      const data = await res.json()
      setConnStatus(prev => ({ ...prev, [channelId]: data.correct ? 'CONNECTED' : 'ERROR' }))
    } catch {
      setConnStatus(prev => ({ ...prev, [channelId]: 'ERROR' }))
    }
    setTesting(null)
  }

  const publishAllDraft = async () => {
    setPublishing(true)
    try {
      const token = getKeyApi()
      await fetch(
        `${getApiUrl()}/COMMERCE-SERVICE/vn-api/v2/woocommerce/publish-batch`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' }, body: JSON.stringify({ status: 'DRAFT' }) }
      )
      fetchData()
    } catch { /* silent */ }
    setPublishing(false)
  }

  const card = { bgcolor: 'background.paper', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>WordPress</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5, mb: 4 }}>Gestiona la conexion WooCommerce y productos publicados</Typography>

      {/* Channels */}
      <Typography sx={{ fontWeight: 600, fontSize: 16, mb: 2 }}>Canales configurados</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          {[1, 2].map(i => <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : channels.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ ...card, p: 4, textAlign: 'center', mb: 4 }}>
            <Globe size={36} color="#ccc" />
            <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>No hay canales WooCommerce configurados.</Typography>
          </Box>
        </motion.div>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
          {channels.map((ch, i) => {
            const st = connStatus[ch.id] || ch.status || 'DISCONNECTED'
            const cfg = statusChip[st] || statusChip.DISCONNECTED
            const Icon = cfg.icon
            return (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Box sx={{ ...card, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: '#0071e310', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={20} color="#0071e3" />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{ch.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{ch.baseUrl || 'URL no configurada'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip icon={<Icon size={13} />} label={st} size="small" sx={{ borderRadius: 99, fontWeight: 500, fontSize: 11, bgcolor: cfg.bg, color: cfg.color, '& .MuiChip-icon': { color: cfg.color } }} />
                    <Button size="small" variant="contained" disabled={testing === ch.id} onClick={() => testConnection(ch.id)}
                      sx={{ borderRadius: 99, textTransform: 'none', fontSize: 12, fontWeight: 600, bgcolor: '#0071e3', px: 2, '&:hover': { bgcolor: '#005bb5' } }}>
                      {testing === ch.id ? 'Probando...' : 'Test Conexion'}
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )
          })}
        </Box>
      )}

      {/* Published products */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>Productos publicados</Typography>
        <Button size="small" variant="contained" startIcon={<Send size={14} />} disabled={publishing} onClick={publishAllDraft}
          sx={{ borderRadius: 99, textTransform: 'none', fontSize: 12, fontWeight: 600, bgcolor: '#0071e3', px: 2.5, '&:hover': { bgcolor: '#005bb5' } }}>
          {publishing ? 'Publicando...' : 'Publicar Borradores'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : products.length === 0 ? (
        <Box sx={{ ...card, p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>No hay productos publicados aun.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Box sx={{ ...card, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{p.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>${p.price?.toFixed(2) ?? '0.00'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={p.syncStatus || 'SYNCED'} size="small"
                    sx={{ borderRadius: 99, fontSize: 11, fontWeight: 500, bgcolor: '#10b98115', color: '#059669' }} />
                  {p.wpPermalink && (
                    <a href={p.wpPermalink} target="_blank" rel="noopener noreferrer" style={{ color: '#0071e3', display: 'flex' }}>
                      <ExternalLink size={16} />
                    </a>
                  )}
                </Box>
              </Box>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  )
}
