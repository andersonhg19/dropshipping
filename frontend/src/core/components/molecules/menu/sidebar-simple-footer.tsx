'use client'

import * as React from 'react'

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

export default function SidebarSimpleFooter({ mini = false }: { mini?: boolean }) {
  const { cardBgColor, cardBorderColor, textSecondaryColor } = usePaletteVars()

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="flex-end"
      spacing={1}
      sx={{
        py: mini ? { xs: 2, md: 10 } : { xs: 1.5, sm: 2 },
        px: { xs: 0.5, sm: 1 },
        bgcolor: cardBgColor,
        borderTop: `1px solid ${cardBorderColor}`,
        minHeight: { xs: 100, sm: 120 },
        width: '100%',
      }}
    >
      <Box sx={{ pb: 1 }}>
        <Typography variant="subtitle2" sx={{ color: textSecondaryColor, fontWeight: 600 }}>
          VISNEX
        </Typography>
      </Box>
      <Divider sx={{ width: '70%', my: 0.5 }} />
      {!mini && (
        <Typography
          variant="caption"
          sx={{
            color: textSecondaryColor,
            textAlign: 'center',
            fontSize: { xs: 10, sm: 12 },
            width: '100%',
            opacity: 0.85,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          &copy; {new Date().getFullYear()}
          <br />
          Todos los derechos reservados.
        </Typography>
      )}
    </Stack>
  )
}
