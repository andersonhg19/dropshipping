'use client'

import { useState } from 'react'

import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

import Input from '@components/atoms/Input'
import Label from '@components/atoms/Label'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { requestResetLinkApi } from '@api/admin/auth/request-reset-link-api'

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleResetPassword = async () => {
    const resp: any = await requestResetLinkApi(email)
    if (resp?.correct !== false) {
      setMessage(t('lbl_Password_reset_email_sent'))
      setError(null)
    } else {
      // Ojo: por seguridad, podemos seguir mostrando mensaje neutro
      setMessage(t('lbl_Password_reset_email_sent'))
      setError(null)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 }, width: '100%' }}>
      <Typography variant="h6">{t('lbl_reset_password')}</Typography>

      <Box>
        <Label htmlFor={t('lbl_email')} text={t('lbl_email')} />
        <Input
          type="email"
          placeholder={t('msj_enter_your_email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autocomplete="email"
        />
      </Box>

      {message && <Typography color="primary">{message}</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <FancyButton label={t('lbl_reset_password')} onClick={handleResetPassword} variant="primary" />
    </Box>
  )
}

export default ForgotPasswordForm
