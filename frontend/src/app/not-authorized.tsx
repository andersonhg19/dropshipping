import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import BlankLayout from '@components/layouts/blank-layout'

import FooterIllustrations from '@utils/footer-illustrations'

const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw',
  },
}))

const Img = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(10),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(10),
  },
  [theme.breakpoints.down('md')]: {
    height: 400,
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(13),
  },
}))

type Error401Type = React.FC & { getLayout?: (page: React.ReactNode) => JSX.Element }

const Error401: Error401Type = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()

  const handleLogout = (url: string): void => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }

  return (
    <Box className="content-center">
      <Box
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <BoxWrapper>
          <Typography variant="h1">401</Typography>
          <Typography variant="h5" sx={{ mb: 1, fontSize: '1.5rem !important' }}>
            You are not authorized! 🔐
          </Typography>
          <Typography variant="body2">You don&apos;t have permission to access this page. Go Home!</Typography>
        </BoxWrapper>
        <Img height="487" alt="error-illustration" src="/images/pages/401.png" />

        {/* Container for buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button component="a" variant="contained" sx={{ px: 5.5, mr: 2 }} onClick={() => handleLogout('/dashboard')}>
            Back Home
          </Button>
          <Button component="a" variant="contained" sx={{ px: 5.5 }} onClick={() => handleLogout('/pages/login')}>
            Logout
          </Button>
        </Box>
      </Box>
      <FooterIllustrations image={undefined} />
    </Box>
  )
}

// Tipamos la propiedad getLayout para que reciba un ReactNode
Error401.getLayout = (page: React.ReactNode): JSX.Element => <BlankLayout>{page}</BlankLayout>

export default Error401
