'use client'

import React from 'react'

import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import PublishOutlinedIcon from '@mui/icons-material/PublishOutlined'
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

export default function DashboardContent() {
  const { t } = useTranslation()
  const palette = usePaletteVars()

  const stats = [
    {
      label: t('lbl_products'),
      value: '0',
      icon: InventoryOutlinedIcon,
      color: '#3b82f6',
    },
    {
      label: t('lbl_supplier'),
      value: '0',
      icon: LocalShippingOutlinedIcon,
      color: '#10b981',
    },
    {
      label: t('lbl_publish'),
      value: '0',
      icon: PublishOutlinedIcon,
      color: '#8b5cf6',
    },
    {
      label: t('lbl_trending'),
      value: '0',
      icon: TrendingUpOutlinedIcon,
      color: '#f59e0b',
    },
  ]

  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        VISNEX Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  bgcolor: palette.cardBgColor,
                  border: `1px solid ${palette.cardBorderColor}`,
                }}
              >
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${stat.color}15`,
                    }}
                  >
                    <Icon sx={{ color: stat.color, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.textSecondaryColor }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 2, bgcolor: palette.cardBgColor }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" sx={{ color: palette.textSecondaryColor, mb: 1 }}>
            Bienvenido a VISNEX
          </Typography>
          <Typography variant="body2" sx={{ color: palette.textSecondaryColor }}>
            Tu plataforma de dropshipping automatizado. Usa el menu lateral para navegar.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
