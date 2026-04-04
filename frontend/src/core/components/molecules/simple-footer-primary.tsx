'use client'

import * as React from 'react'

import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function SimpleFooterPrimary({ mini = false }: { mini?: boolean }) {
  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="flex-end"
      spacing={1}
      sx={{
        py: { xs: 1.5, sm: 2 },
        px: { xs: 1, sm: 2 },
        bgcolor: (theme) => theme.palette.background.paper,
        minHeight: { xs: 70, sm: 80 },
        width: '100%',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: (theme) => theme.palette.text.secondary,
            fontSize: { xs: 11, sm: 13 },
            opacity: 0.85,
            whiteSpace: 'pre-line',
            fontWeight: 500,
          }}
        >
          &copy; {new Date().getFullYear()} VISNEX
          {mini ? '' : '\nTodos los derechos reservados.'}
        </Typography>
      </Stack>
      <Divider sx={{ width: '70%', my: 0.5 }} />
    </Stack>
  )
}
