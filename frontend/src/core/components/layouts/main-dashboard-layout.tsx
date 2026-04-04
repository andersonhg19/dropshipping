import React from 'react'

import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Drawer from '@mui/material/Drawer'
import Toolbar from '@mui/material/Toolbar'

interface DashboardLayoutProps {
  sidebarFooter?: React.ReactNode
  toolbarAccount?: React.ReactNode
  toolbarActions?: React.ReactNode
  children: React.ReactNode
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  sidebarFooter,
  toolbarAccount,
  toolbarActions,
  children,
}) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Drawer variant="permanent" anchor="left">
        {/* TODO: agrega aquí tu navegación */}
        {/* ... */}
        {sidebarFooter && <Box sx={{ mt: 'auto' }}>{sidebarFooter}</Box>}
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>{toolbarActions}</Box>
            {toolbarAccount}
          </Toolbar>
        </AppBar>
        <Container maxWidth={false} sx={{ mt: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  )
}
