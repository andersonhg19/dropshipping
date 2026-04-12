'use client'
import React from 'react'
import { Box, Typography } from '@mui/material'
import { Settings } from 'lucide-react'

export default function EnrichmentConfigPage() {
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto', textAlign: 'center', py: 8 }}>
      <Settings size={48} color="#ccc" />
      <Typography sx={{ fontSize: 28, fontWeight: 700, mt: 3, letterSpacing: '-0.02em' }}>
        Configuracion IA
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 1 }}>
        Esta funcionalidad estara disponible proximamente.
      </Typography>
    </Box>
  )
}
