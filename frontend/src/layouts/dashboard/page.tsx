'use client'

import React from 'react'

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { Box, Grid, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

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

  const stats = [
    { label: t('lbl_products'), value: 0, icon: InventoryOutlinedIcon, color: '#0071e3' },
    { label: t('lbl_supplier'), value: 0, icon: LocalShippingOutlinedIcon, color: '#34c759' },
    { label: t('lbl_publish'), value: 0, icon: PublishOutlinedIcon, color: '#af52de' },
    { label: t('lbl_trending'), value: 0, icon: ScheduleOutlinedIcon, color: '#ff9f0a' },
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
      href: '/dashboard/commerce/products',
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

  const card = {
    borderRadius: '16px',
    background: palette.cardBgColor,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
    border: 'none',
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
      {/* Hero */}
      <motion.div {...fade(0)}>
        <Box sx={{ mb: 5 }}>
          <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, color: palette.textColor, letterSpacing: '-0.02em' }}>
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
                <Box sx={{ ...card, p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
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
                    <Icon sx={{ color: s.color, fontSize: 24 }} />
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

      {/* Quick Actions */}
      <motion.div {...fade(0.45)}>
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: palette.textColor, mb: 2 }}>
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
                  onClick={() => router.push(a.href)}
                  sx={{
                    ...card,
                    p: 3.5,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.1)',
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
                    <Icon sx={{ color: a.color, fontSize: 22 }} />
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
        <Typography sx={{ fontSize: 20, fontWeight: 600, color: palette.textColor, mb: 2 }}>
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
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#0071e3', flexShrink: 0 }} />
              <Typography sx={{ fontSize: 14, color: palette.textSecondaryColor }}>{item}</Typography>
              <Typography sx={{ fontSize: 12, color: palette.textSecondaryColor, ml: 'auto', opacity: 0.6 }}>
                Ahora
              </Typography>
            </Box>
          ))}
        </Box>
      </motion.div>
    </Box>
  )
}
