'use client'

import React, { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import NoSsr from '@mui/material/NoSsr'
import Typography from '@mui/material/Typography'
import UserAtom from '@states/UserAtom'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'

import { getUser } from '@utils/utilities'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

type AppUser = { name?: string; lastName?: string } | null

const WelcomeInfo: React.FC = () => {
  const { t } = useTranslation()
  const { textColor, textSecondaryColor } = usePaletteVars()

  // Usar el átomo de Jotai para reactividad
  const userFromAtom = useAtomValue(UserAtom)

  // Estado local para el usuario (se sincroniza con el átomo o localStorage)
  const [user, setUserState] = useState<AppUser>(null)
  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null)

  // Sincronizar con el átomo de Jotai o fallback a localStorage
  useEffect(() => {
    // Si hay usuario en el átomo, usarlo
    if (userFromAtom) {
      setUserState(userFromAtom as AppUser)
    } else {
      // Fallback: intentar leer de localStorage (por si acaso)
      try {
        const localUser = getUser()
        // Solo usar si existe y el átomo está vacío
        setUserState(localUser as AppUser)
      } catch {
        setUserState(null)
      }
    }
  }, [userFromAtom])

  useEffect(() => {
    // Mantener fecha/hora solo en cliente para evitar discrepancias de locale
    setCurrentDateTime(new Date())
    const id = setInterval(() => setCurrentDateTime(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const formattedDate = currentDateTime
    ? currentDateTime.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
    : ''

  const formattedTime = currentDateTime
    ? currentDateTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : ''

  // ✅ En el primer render (SSR y cliente) esto será SIEMPRE el mismo texto
  const welcomeText = user
    ? `${t('lbl_wellcome')} ${user.name ?? ''} ${user.lastName ?? ''}`.trim()
    : t('lbl_wellcomes')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        width: '100%',
        gap: { xs: 0.5, sm: 2 },
        minWidth: 0,
      }}
    >
      <Box sx={{ p: { xs: 0.5, sm: 1 }, minWidth: 0, overflow: 'hidden' }}>
        <Typography
          sx={{
            fontWeight: 'bold',
            color: textColor,
            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem' },
            pr: { xs: 0, sm: 2 },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          suppressHydrationWarning
        >
          {welcomeText}
        </Typography>
      </Box>

      {/* Fecha y hora: oculto en xs para ahorrar espacio en móvil */}
      <NoSsr>
        <Box sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
          <Typography
            variant="body2"
            sx={{
              color: textSecondaryColor,
              fontSize: { sm: '0.75rem', md: '0.875rem' },
              whiteSpace: 'nowrap',
            }}
          >
            {formattedDate && formattedTime ? `${formattedDate} - ${formattedTime}` : ''}
          </Typography>
        </Box>
      </NoSsr>
    </Box>
  )
}

export default WelcomeInfo
