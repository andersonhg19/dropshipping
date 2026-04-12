'use client'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode; fallbackMessage?: string }
interface State { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 8 }}>
          <AlertTriangle size={48} color="#f59e0b" />
          <Typography sx={{ mt: 2, fontWeight: 700, fontSize: 20 }}>Algo salio mal</Typography>
          <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 14 }}>
            {this.props.fallbackMessage || 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.'}
          </Typography>
          <Button onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
            sx={{ mt: 3, bgcolor: '#0071e3', color: '#fff', borderRadius: 99, textTransform: 'none', px: 3 }}
            startIcon={<RefreshCw size={16} />}>
            Recargar pagina
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
