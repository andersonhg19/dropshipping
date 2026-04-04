'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { Alert, AlertColor, Snackbar } from '@mui/material'

type MuiSeverity = AlertColor | 'secondary' | 'contrast'

interface ToastContextType {
  showToast: (detail: string, severity?: MuiSeverity, summary?: string, life?: number) => void
  showSuccess: (detail: string, summary?: string, life?: number) => void
  showInfo: (detail: string, summary?: string, life?: number) => void
  showWarn: (detail: string, summary?: string, life?: number) => void
  showError: (detail: string, summary?: string, life?: number) => void
  showSecondary: (detail: string, summary?: string, life?: number) => void
  showContrast: (detail: string, summary?: string, life?: number) => void
  clearToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<{ detail: string; summary?: string }>({ detail: '' })
  const [severity, setSeverity] = useState<MuiSeverity>('info')
  const [life, setLife] = useState<number>(3000)

  const close = () => setOpen(false)

  const mapSeverityToMUI = (sev: MuiSeverity): AlertColor => {
    if (sev === 'secondary' || sev === 'contrast') return 'info' // mapea a algo existente en MUI
    return sev
  }

  const showToast = useCallback((detail: string, sev: MuiSeverity = 'info', summary?: string, l: number = 3000) => {
    setMessage({ detail, summary })
    setSeverity(sev)
    setLife(l)
    setOpen(true)
  }, [])

  const make = (sev: MuiSeverity) => (detail: string, summary?: string, l?: number) =>
    showToast(detail, sev, summary, l)

  const value = useMemo<ToastContextType>(
    () => ({
      showToast,
      clearToast: close,
      showSuccess: make('success'),
      showInfo: make('info'),
      showWarn: make('warning'),
      showError: make('error'),
      showSecondary: make('secondary'),
      showContrast: make('contrast'),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        onClose={close}
        autoHideDuration={life}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={close} severity={mapSeverityToMUI(severity)} variant="filled" sx={{ width: '100%' }}>
          {message.summary ? <strong style={{ marginRight: 4 }}>{message.summary} — </strong> : null}
          {message.detail}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
