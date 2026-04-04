'use client'

import { useMemo, useState } from 'react'

import { Card, CardContent, IconButton, InputAdornment, Typography, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import CustomTextField from '@components/atoms/custom-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { confirmResetApi } from '@api/admin/auth/confirm-reset-api'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const sp = useSearchParams()
  const router = useRouter()
  const token = sp.get('token') || ''

  const muiTheme = useTheme()
  const {
    cardBgColor,
    cardBorderColor,
    textColor,
    textSecondaryColor,
    inputBgColor,
    inputBorderColor,
    buttonBgColor,
    buttonTextColor,
  } = usePaletteVars()

  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)

  const [globalMsg, setGlobalMsg] = useState<string | null>(null)
  const [globalErr, setGlobalErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Validaciones por campo
  const err1 = useMemo(() => {
    if (!p1) return ''
    if (p1.length < 8) return t('msj_Password_too_short') as string
    return ''
  }, [p1, t])

  const err2 = useMemo(() => {
    if (!p2) return ''
    if (p1 && p2 && p1 !== p2) return t('msj_Passwords_not_match') as string
    return ''
  }, [p1, p2, t])

  const formValid = !!token && p1.length >= 8 && p1 === p2

  const onSubmit = async () => {
    setGlobalMsg(null)
    setGlobalErr(null)

    if (!formValid) {
      setGlobalErr(t('msj_Error_reset_password'))
      return
    }

    try {
      setLoading(true)
      const resp: any = await confirmResetApi(token, p1)
      if (resp?.correct !== false) {
        setGlobalMsg(t('msj_Password_reset_success'))
        setGlobalErr(null)
        router.push('/users/login')
      } else {
        setGlobalErr(resp?.message || t('msj_Error_reset_password'))
      }
    } catch {
      setGlobalErr(t('msj_Error_reset_password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Grid
      container
      justifyContent="center"
      sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmit()
      }}
    >
      <Grid size={{ xs: 12, sm: 10, md: 6, lg: 4 }}>
        <Card
          elevation={1}
          sx={{
            background: cardBgColor,
            borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
            border: `1px solid ${cardBorderColor}`,
            boxShadow: muiTheme.shadows[4],
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 2, color: textColor, fontWeight: 700 }}>
              {t('lbl_reset_password')}
            </Typography>

            {/* New password */}
            <CustomTextField
              label={t('lbl_new_password')}
              name="newPassword"
              type={show1 ? 'text' : 'password'}
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              error={Boolean(err1)}
              helperText={err1}
              autoComplete="new-password"
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShow1((v) => !v)} edge="end">
                      {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Confirm password */}
            <CustomTextField
              label={t('lbl_confirm_password')}
              name="confirmPassword"
              type={show2 ? 'text' : 'password'}
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              error={Boolean(err2)}
              helperText={err2}
              autoComplete="new-password"
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={() => setShow2((v) => !v)} edge="end">
                      {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {/* Mensajes globales */}
            {globalMsg && <Typography sx={{ color: 'green', mb: 1 }}>{globalMsg}</Typography>}
            {globalErr && <Typography sx={{ color: 'red', mb: 1 }}>{globalErr}</Typography>}

            <FancyButton
              label={loading ? t('btn_saving') : t('btn_save')}
              onClick={onSubmit}
              className="h-12 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
                width: '100%',
              }}
              disabled={!formValid || loading}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
