'use client'

import * as React from 'react'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { usePathname } from 'next/navigation'
import theme from 'theme'

import GlobalBootstrapper from '@components/molecules/global-bootstrapper'
import Navbar from '@components/molecules/navbar'

import '@styles/tailwind.css'

import { FilialStyleProvider } from '@hooks/context/filial-style-context'
import { SidebarProvider } from '@hooks/context/sidebar-context'
import { ToastProvider } from '@hooks/context/toast-context'
import { ThemeProvider } from '@hooks/ui/use-theme'
import { useTheme } from '@hooks/ui/use-theme'

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme()
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  const currentTheme = mode === 'dark' ? theme.dark : theme.light

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: currentTheme.palette.background.paper,
        }}
      >
        {!isDashboard && <Navbar />}
        {children}
      </div>
    </MuiThemeProvider>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0, padding: 0 }}>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider>
            <SidebarProvider>
              <ToastProvider>
                <FilialStyleProvider>
                  <GlobalBootstrapper />
                  <ThemedApp>{children}</ThemedApp>
                </FilialStyleProvider>
              </ToastProvider>
            </SidebarProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
