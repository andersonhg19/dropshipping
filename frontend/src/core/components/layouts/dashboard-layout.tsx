'use client'

import * as React from 'react'

import BarChartIcon from '@mui/icons-material/BarChart'
import DashboardIcon from '@mui/icons-material/Dashboard'
import DescriptionIcon from '@mui/icons-material/Description'
import { Box, Typography } from '@mui/material'
import { AppProvider } from '@toolpad/core/AppProvider'
import { type Navigation } from '@toolpad/core/AppProvider'
import { DashboardLayout } from '@toolpad/core/DashboardLayout'
import { useDemoRouter } from '@toolpad/core/internal'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'

import SettingsControls from '@components/molecules/settings-controls'

function DemoPageContent({ pathname }: { pathname: string }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  )
}

interface DemoProps {
  /**
   * Injected by the documentation to work in an iframe.
   * Remove this when copying and pasting into your project.
   */
  window?: () => Window
}

export default function DashboardLayoutBasic(props: DemoProps) {
  const { window } = props

  const router = useDemoRouter('/dashboard')
  // const router = useRouter();
  const { t } = useTranslation()

  const demoWindow = window !== undefined ? window() : undefined

  const VerticalNavigation: Navigation = [
    { kind: 'header', title: t('lbl_mainItems') }, // Traducción de "Main items"
    {
      segment: 'dashboard',
      title: t('lbl_dashboard'),
      icon: <DashboardIcon />,
    },
    { kind: 'divider' },
    { kind: 'header', title: t('lbl_administration') },
    {
      segment: 'dashboard/users',
      title: t('lbl_users'),
      icon: <BarChartIcon />,
      children: [
        {
          segment: 'type-user',
          title: t('lbl_typeUsers'),
          icon: <DescriptionIcon />,
        },
      ],
    },
  ]

  return (
    <AppProvider
      navigation={VerticalNavigation}
      router={router}
      window={demoWindow}
      branding={{
        logo: (
          <div style={{ width: '80px', height: '80px', position: 'relative' }}>
            <Image
              src="/logo/visnex-dark.svg"
              alt="Platform logo"
              width={80}
              height={80}
              style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
              priority
            />
          </div>
        ),
        title: 'VISNEX',
      }}
    >
      <DashboardLayout
        slots={{
          toolbarActions: SettingsControls,
        }}
      >
        <DemoPageContent pathname={router.pathname} />
      </DashboardLayout>
    </AppProvider>
  )
}
