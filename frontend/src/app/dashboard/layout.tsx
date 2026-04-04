'use client'

import * as React from 'react'
import { Suspense, useEffect } from 'react'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import UserAtom from '@states/UserAtom'
import { DashboardLayout } from '@toolpad/core/DashboardLayout'
import { PageContainer } from '@toolpad/core/PageContainer'
import { NextAppProvider } from '@toolpad/core/nextjs'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import theme from 'theme'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'
import GridExportDrawer from '@components/molecules/grid-export-drawer'
import DashboardHeaderAccount from '@components/molecules/menu/dashboard-header-account'
import DashboardHeaderActions from '@components/molecules/menu/dashboard-header-actions'
import SidebarSimpleFooter from '@components/molecules/menu/sidebar-simple-footer'

import { GridExportProvider } from '@hooks/context/grid-export-context'
import { useTheme } from '@hooks/ui/use-theme'

import { getFilteredNavigation } from '@config/navigation/nav-privileges'
import { buildVerticalNavigation } from '@config/navigation/vertical-navigation'

function ThemedDashboard({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const router = useRouter()
  const { mode } = useTheme()
  const muiTheme = useMuiTheme()
  const currentTheme = mode === 'dark' ? theme.dark : theme.light
  const logoSrc = muiTheme.palette.mode === 'dark' ? '/logo/logo-claro.png' : '/logo/logo-oscuro.png'

  // Escuchar cambios en el usuario para recalcular la navegación
  const user = useAtomValue(UserAtom)

  const [nav, setNav] = React.useState<any[] | null>(null)

  useEffect(() => {
    // Recalcular navegación cuando cambia el usuario o las traducciones
    const raw = buildVerticalNavigation(t)
    const filtered = getFilteredNavigation(raw as any)
    setNav(filtered)
  }, [t, user])

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <NextAppProvider
        theme={currentTheme}
        navigation={nav || []}
        branding={{
          homeUrl: '/dashboard',
          logo: (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt="Logo"
              onClick={() => router.push('/dashboard')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/dashboard')}
              style={{
                width: 'clamp(48px, 12vw, 90px)',
                height: 'clamp(48px, 12vw, 90px)',
                objectFit: 'contain',
                filter: mode === 'dark' ? 'brightness(1.2)' : 'none',
                cursor: 'pointer',
              }}
            />
          ),
          title: '',
        }}
      >
        <GridExportProvider>
          <DashboardLayout
            defaultSidebarCollapsed={true}
            disableCollapsibleSidebar={false}
            slots={{
              toolbarAccount: DashboardHeaderActions,
              toolbarActions: DashboardHeaderAccount,
              sidebarFooter: SidebarSimpleFooter,
            }}
          >
            <PageContainer sx={{ px: { xs: 1.5, sm: 2, md: 3 } }}>{children}</PageContainer>
          </DashboardLayout>
          <GridExportDrawer />
        </GridExportProvider>
      </NextAppProvider>
    </MuiThemeProvider>
  )
}

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CustomLoader />}>
      <ThemedDashboard>{props.children}</ThemedDashboard>
    </Suspense>
  )
}
