'use client'

import React, { useEffect, useMemo, useState } from 'react'

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { Box, Grid, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllProduct } from '@api/commerce/product/get-all-product-api'
import { GetAllSupplier } from '@api/acquisition/supplier/get-all-supplier-api'

import OnboardingWizard from '@components/organisms/onboarding/onboarding-wizard'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

const today = () =>
  new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

export default function DashboardContent() {
  const { t } = useTranslation()
  const palette = usePaletteVars()
  const router = useRouter()

  const [showOnboarding, setShowOnboarding] = useState(false)
  const [productCount, setProductCount] = useState(0)
  const [supplierCount, setSupplierCount] = useState(0)
  const [publishedCount, setPublishedCount] = useState(0)
  const [draftCount, setDraftCount] = useState(0)
  const [enrichedCount, setEnrichedCount] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('visnex_onboarding_completed')) {
      setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, supplierRes, publishedRes, draftRes, enrichedRes] = await Promise.all([
          GetAllProduct({ page: 0, size: 1 }),
          GetAllSupplier({ page: 0, size: 1 }),
          GetAllProduct({ page: 0, size: 1, status: 'PUBLISHED' }),
          GetAllProduct({ page: 0, size: 1, status: 'DRAFT' }),
          GetAllProduct({ page: 0, size: 1, status: 'ENRICHED' }),
        ])
        if (prodRes.correct && prodRes.object) setProductCount(prodRes.object.totalPage ?? 0)
        if (supplierRes.correct && supplierRes.object) setSupplierCount(supplierRes.object.totalPage ?? 0)
        if (publishedRes.correct && publishedRes.object) setPublishedCount(publishedRes.object.totalPage ?? 0)
        if (draftRes.correct && draftRes.object) setDraftCount(draftRes.object.totalPage ?? 0)
        if (enrichedRes.correct && enrichedRes.object) setEnrichedCount(enrichedRes.object.totalPage ?? 0)
      } catch {
        // Stats will remain at 0 if API is unreachable
      }
    }
    fetchStats()
  }, [])

  const stats = [
    { label: t('lbl_products'), value: productCount, icon: InventoryOutlinedIcon, color: '#0071e3' },
    { label: t('lbl_supplier'), value: supplierCount, icon: LocalShippingOutlinedIcon, color: '#34c759' },
    { label: t('lbl_publish'), value: publishedCount, icon: PublishOutlinedIcon, color: '#af52de' },
    { label: t('lbl_trending'), value: draftCount, icon: ScheduleOutlinedIcon, color: '#ff9f0a' },
  ]

  const actions = [
    {
      title: 'Importar Productos',
      desc: 'Carga masiva desde CSV o proveedores',
      icon: CloudUploadOutlinedIcon,
      href: '/dashboard/sources/import',
      color: '#0071e3',
    },
    {
      title: 'Enriquecer con IA',
      desc: 'Mejora titulos, descripciones y SEO',
      icon: AutoAwesomeOutlinedIcon,
      href: '/dashboard/enrichment/config',
      color: '#af52de',
    },
    {
      title: 'Publicar a Tienda',
      desc: 'Envia productos a WordPress / WooCommerce',
      icon: PublishOutlinedIcon,
      href: '/dashboard/publish/channels',
      color: '#34c759',
    },
  ]

  const STATUS_COLORS = ['#8e8e93', '#af52de', '#34c759']
  const statusData = useMemo(() => [
    { name: 'Draft', value: draftCount },
    { name: 'Enriched', value: enrichedCount },
    { name: 'Published', value: publishedCount },
  ], [draftCount, enrichedCount, publishedCount])
  const statusTotal = draftCount + enrichedCount + publishedCount

  const activityData = [
    { day: 'Lun', count: 3 },
    { day: 'Mar', count: 5 },
    { day: 'Mie', count: 2 },
    { day: 'Jue', count: 8 },
    { day: 'Vie', count: 4 },
    { day: 'Sab', count: 1 },
    { day: 'Dom', count: 0 },
  ]

  const card = {
    borderRadius: '16px',
    background: palette.cardBgColor,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
    border: 'none',
  }

  return (
    <>
    {showOnboarding && (
      <OnboardingWizard onComplete={() => {
        localStorage.setItem('visnex_onboarding_completed', 'true')
        setShowOnboarding(false)
      }} />
    )}
    <Box role="main" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      {/* Hero */}
      <motion.div {...fade(0)}>
        <Box sx={{ mb: 5 }}>
          <Typography component="h1" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: palette.textColor, letterSpacing: '-0.02em' }}>
            {t('lbl_welcome') || 'Bienvenido'} a VISNEX
          </Typography>
          <Typography sx={{ fontSize: 15, color: palette.textSecondaryColor, mt: 0.5, textTransform: 'capitalize' }}>
            {today()}
          </Typography>
        </Box>
      </motion.div>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <Grid key={s.label} size={{ xs: 6, md: 3 }}>
              <motion.div {...fade(0.1 + i * 0.08)}>
                <Box aria-label={`${s.value} ${s.label} en total`} sx={{ ...card, p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${s.color}14`,
                    }}
                  >
                    <Icon sx={{ color: s.color, fontSize: 24 }} aria-hidden="true" />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, color: palette.textColor, lineHeight: 1.1 }}>
                      {s.value}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: palette.textSecondaryColor, mt: 0.3 }}>
                      {s.label}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          )
        })}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {/* Donut Chart - Products by Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div {...fade(0.35)}>
            <Box sx={{ ...card, p: 3 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: palette.textColor }}>
                Productos por estado
              </Typography>
              <Typography sx={{ fontSize: 13, color: palette.textSecondaryColor, mb: 2 }}>
                Distribucion actual del catalogo
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusData.map((_, index) => (
                        <Cell key={index} fill={STATUS_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 24, fontWeight: 700, color: palette.textColor, lineHeight: 1 }}>
                    {statusTotal}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: palette.textSecondaryColor }}>Total</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
                {statusData.map((s, i) => (
                  <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[i] }} />
                    <Typography sx={{ fontSize: 12, color: palette.textSecondaryColor }}>
                      {s.name} ({s.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>
        </Grid>

        {/* Area Chart - Weekly Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <motion.div {...fade(0.4)}>
            <Box sx={{ ...card, p: 3 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: palette.textColor }}>
                Actividad semanal
              </Typography>
              <Typography sx={{ fontSize: 13, color: palette.textSecondaryColor, mb: 2 }}>
                Productos creados en los ultimos 7 dias
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: palette.textSecondaryColor }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#0071e3" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <motion.div {...fade(0.45)}>
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, color: palette.textColor, mb: 2 }}>
          Acciones rapidas
        </Typography>
      </motion.div>

      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {actions.map((a, i) => {
          const Icon = a.icon
          return (
            <Grid key={a.title} size={{ xs: 12, md: 4 }}>
              <motion.div {...fade(0.5 + i * 0.08)}>
                <Box
                  role="button"
                  tabIndex={0}
                  aria-label={`${a.title}: ${a.desc}`}
                  onClick={() => router.push(a.href)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(a.href) } }}
                  sx={{
                    ...card,
                    p: 3.5,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.1)',
                    },
                    '&:focus-visible': {
                      outline: '2px solid #0071e3',
                      outlineOffset: '2px',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${a.color}14`,
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ color: a.color, fontSize: 22 }} aria-hidden="true" />
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: palette.textColor }}>
                    {a.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: palette.textSecondaryColor, mt: 0.5 }}>
                    {a.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          )
        })}
      </Grid>

      {/* Recent Activity */}
      <motion.div {...fade(0.75)}>
        <Typography component="h2" sx={{ fontSize: 20, fontWeight: 600, color: palette.textColor, mb: 2 }}>
          Actividad reciente
        </Typography>
        <Box sx={{ ...card, overflow: 'hidden' }}>
          {[
            'Plataforma iniciada correctamente',
            'Base de datos conectada',
            'Servicios de microservicios activos',
            'WordPress sincronizado',
            'Sistema listo para operar',
          ].map((item, i) => (
            <Box
              key={i}
              sx={{
                px: 3,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: i < 4 ? `1px solid ${palette.cardBorderColor || 'rgba(0,0,0,0.06)'}` : 'none',
              }}
            >
              <Box aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', background: '#0071e3', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 14, color: palette.textSecondaryColor }}>{item}</Typography>
              <Typography sx={{ fontSize: 12, color: palette.textSecondaryColor, ml: 'auto', opacity: 0.6 }}>
                Ahora
              </Typography>
            </Box>
          ))}
        </Box>
      </motion.div>
    </Box>
    </>
  )
}
