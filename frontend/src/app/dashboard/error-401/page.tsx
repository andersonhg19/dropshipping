'use client'

import React, { Suspense, useState } from 'react'

import { LoadingFallback } from '@components/atoms/loading-fallback'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import BlankLayout from '@components/layouts/blank-layout'

const BoxWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '95vw',
  },
}))

const Img = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  maxWidth: 487,
  objectFit: 'contain',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    maxHeight: 280,
  },
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    maxHeight: 450,
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(8),
    maxHeight: 487,
  },
}))

function Error401Content() {
  const [anchorEl, setAnchorEl] = useState(null)
  const router = useRouter()

  const handleLogout = (url: string) => {
    if (url) router.push(url)
    setAnchorEl(null)
  }

  return (
    <Box className="content-center">
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <BoxWrapper>
          <Typography variant="h1" sx={{ fontSize: { xs: '3rem', sm: '4rem', md: '5rem' } }}>
            401
          </Typography>
          <Typography variant="h5" sx={{ mb: 1, fontSize: { xs: '1.1rem', sm: '1.35rem', md: '1.5rem' } }}>
            You are not authorized! 🔐
          </Typography>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
            You don&prime;t have permission to access this page. Go Home!
          </Typography>
        </BoxWrapper>
        <Img alt="error-illustration" src="/images/pages/401.png" />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: 2,
            mt: 2,
            width: { xs: '100%', sm: 'auto' },
            maxWidth: 320,
          }}
        >
          <Button
            component="a"
            variant="contained"
            fullWidth
            sx={{ px: { xs: 2, sm: 5.5 } }}
            onClick={() => handleLogout('/dashboard')}
          >
            Back Home
          </Button>
          <Button
            component="a"
            variant="contained"
            fullWidth
            sx={{ px: { xs: 2, sm: 5.5 } }}
            onClick={() => handleLogout('/pages/login')}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

// Aquí está el truco: exportar un componente envuelto en Suspense
const Error401 = () => (
  <Suspense fallback={<LoadingFallback />}>
    <Error401Content />
  </Suspense>
)

// Si usas layout custom:
Error401.getLayout = (
  page:
    | string
    | number
    | bigint
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | Iterable<React.ReactNode>
    | React.ReactPortal
    | Promise<React.AwaitedReactNode>
    | null
    | undefined
) => <BlankLayout>{page}</BlankLayout>

export default Error401
