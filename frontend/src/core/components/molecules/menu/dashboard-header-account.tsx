'use client'

import React from 'react'

import Box from '@mui/material/Box'

import WelcomeInfo from '@components/molecules/welcome-info'

function DashboardHeaderAccount() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', sm: 'center' },
        flex: { xs: 1, md: '1 1 auto' },
        minWidth: 0,
        overflow: 'hidden',
        px: { xs: 0, sm: 2, md: 4 },
      }}
    >
      <WelcomeInfo />
    </Box>
  )
}

export default React.memo(DashboardHeaderAccount)
