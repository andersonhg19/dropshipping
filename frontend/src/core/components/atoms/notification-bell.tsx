'use client'

import React, { useEffect, useState } from 'react'
import { Badge, Box, IconButton, List, ListItem, ListItemText, Popover, Typography } from '@mui/material'
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  time: string
  read: boolean
}

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Load notifications from localStorage (in production, this would be an API call)
    const stored = localStorage.getItem('visnex_notifications')
    if (stored) {
      try { setNotifications(JSON.parse(stored)) } catch {}
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type, title, message,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }
    const updated = [newNotif, ...notifications].slice(0, 20)
    setNotifications(updated)
    localStorage.setItem('visnex_notifications', JSON.stringify(updated))
  }

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem('visnex_notifications', JSON.stringify(updated))
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('visnex_notifications')
    setAnchorEl(null)
  }

  const iconByType = {
    success: <CheckCircle size={16} color="#10b981" />,
    warning: <AlertTriangle size={16} color="#f59e0b" />,
    info: <Info size={16} color="#3b82f6" />,
    error: <X size={16} color="#ef4444" />,
  }

  // Expose addNotification globally for other components
  useEffect(() => {
    (window as any).__visnexNotify = addNotification
  }, [notifications])

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label={`${unreadCount} notificaciones sin leer`}>
        <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 18, minWidth: 18 } }}>
          <Bell size={20} />
        </Badge>
      </IconButton>

      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { borderRadius: 3, width: 340, maxHeight: 400, mt: 1 } }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>Notificaciones</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Typography onClick={markAllRead} sx={{ fontSize: 12, color: '#0071e3', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                Marcar leidas
              </Typography>
            )}
            {notifications.length > 0 && (
              <Typography onClick={clearAll} sx={{ fontSize: 12, color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'text.secondary' } }}>
                Limpiar
              </Typography>
            )}
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Bell size={32} color="#ccc" />
            <Typography sx={{ mt: 1, fontSize: 13, color: 'text.secondary' }}>Sin notificaciones</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 320, overflow: 'auto' }}>
            {notifications.map(n => (
              <ListItem key={n.id} sx={{
                py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'divider',
                bgcolor: n.read ? 'transparent' : 'action.hover',
              }}>
                <Box sx={{ mr: 1.5, mt: 0.5 }}>{iconByType[n.type]}</Box>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: n.read ? 400 : 600, fontSize: 13 }}>{n.title}</Typography>}
                  secondary={
                    <Box>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{n.message}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.3 }}>{n.time}</Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>
    </>
  )
}
