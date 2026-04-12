'use client'

import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export default function ConfirmDialog({
  open, title = 'Confirmar', message, confirmText = 'Confirmar',
  cancelText = 'Cancelar', onConfirm, onCancel, destructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      aria-labelledby="confirm-dialog-title"
      PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
      <DialogTitle id="confirm-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700, fontSize: 18, pb: 0 }}>
        <AlertTriangle size={20} color={destructive ? '#ef4444' : '#f59e0b'} aria-hidden="true" />
        {title}
      </DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 14 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel}
          sx={{ borderRadius: 99, textTransform: 'none', color: 'text.secondary' }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm}
          sx={{
            bgcolor: destructive ? '#ef4444' : '#0071e3', color: '#fff',
            borderRadius: 99, textTransform: 'none', px: 3, fontWeight: 600,
            '&:hover': { bgcolor: destructive ? '#dc2626' : '#0077ED' },
          }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
