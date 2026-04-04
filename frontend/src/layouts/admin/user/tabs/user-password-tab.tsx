'use client'

import React, { useMemo, useState } from 'react'

import { Card, CardContent, Grid, IconButton, InputAdornment, Typography, useTheme } from '@mui/material'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import CustomTextField from '@components/atoms/custom-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { getUser } from '@utils/utilities'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { requestResetLinkApi } from '@api/admin/auth/request-reset-link-api'
import { SaveUserApi } from '@api/admin/user/save-user-api'

import { SaveUserOutputInterface } from '@interfaces/output/admin/save-user-output-interface'
import { UserDTOInterface } from '@interfaces/response/admin/get-all-users-response-interface'

type Props = {
  user: UserDTOInterface
  onUserUpdated: (u: UserDTOInterface | null) => void
}

const UserPasswordTab: React.FC<Props> = ({ user }) => {
  const { t } = useTranslation()
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

  // Estado local para "Asignar ahora"
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

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

  const formValid = p1.length >= 8 && p1 === p2

  const handleSendLink = async () => {
    setMsg(null)
    setErr(null)
    if (!user?.email) {
      setErr(t('msj_Invalid_email'))
      return
    }
    try {
      setLoading(true)
      const r: any = await requestResetLinkApi(user.email)
      if (r?.correct === false) {
        setErr(r?.message || t('lbl_error_unexpected'))
      } else {
        setMsg(t('lbl_Password_reset_email_sent'))
      }
    } catch {
      setErr(t('lbl_error_unexpected'))
    } finally {
      setLoading(false)
    }
  }

  const handleAssignNow = async () => {
    setMsg(null)
    setErr(null)
    if (!formValid) {
      setErr(t('msj_Error_reset_password'))
      return
    }

    try {
      setLoading(true)

      // Preparamos payload mínimo para SaveUserApi con password
      const payload: SaveUserOutputInterface = {
        id: user?.id ? Number(user.id) : 0,
        idCompany: user?.idCompany ? Number(user.idCompany) : 0,
        idSubsidiary: user?.idSubsidiary ? Number(user.idSubsidiary) : null,
        idTypeUser: user?.idTypeUser ? Number(user.idTypeUser) : 0,
        name: user?.name ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        dni: user?.dni ?? '',
        cellphone: user?.cellphone ?? '',
        active: user?.active ?? true,
        admin: false,
        idModifiedBy: getUser() ? Number(getUser().id) : 0,
        password: p1, // <- SOLO acá enviamos password
      }

      const resp: any = await SaveUserApi(payload)
      if (resp?.correct !== false) {
        setMsg(t('msj_Password_reset_success'))
        // No es necesario refrescar user completo; si quieres, puedes volver a cargarlo y llamar onUserUpdated
      } else {
        setErr(resp?.message || t('msj_Error_reset_password'))
      }
    } catch {
      setErr(t('msj_Error_reset_password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      sx={{
        background: cardBgColor,
        borderRadius: muiTheme.shape.borderRadius,
        boxShadow: muiTheme.shadows[3],
        border: `1px solid ${cardBorderColor}`,
      }}
    >
      <CardContent>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {/* Enviar enlace */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
              {t('lbl_send_reset_link')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomTextField
              label={t('lbl_email')}
              name="email"
              value={user?.email ?? ''}
              onChange={() => {}}
              disabled
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Mail size={16} />
                  </InputAdornment>
                ),
              }}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} display="flex" alignItems="center">
            <FancyButton
              variant="primary"
              label={loading ? t('btn_sending') : t('btn_send_link')}
              onClick={handleSendLink}
              className="h-12 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              disabled={loading || !user?.email}
            />
          </Grid>

          {/* Asignar ahora */}
          <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ color: textColor, fontWeight: 700, mb: 1 }}>
              {t('lbl_assign_password_now')}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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
                    <IconButton onClick={() => setShow1((v) => !v)} edge="end" aria-label="toggle">
                      {show1 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
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
                    <IconButton onClick={() => setShow2((v) => !v)} edge="end" aria-label="toggle">
                      {show2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {msg && (
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: 'green' }}>{msg}</Typography>
            </Grid>
          )}
          {err && (
            <Grid size={{ xs: 12 }}>
              <Typography sx={{ color: 'red' }}>{err}</Typography>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <FancyButton
              variant="primary"
              label={loading ? t('btn_saving') : t('btn_save')}
              onClick={handleAssignNow}
              className="h-12 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
              disabled={loading || !formValid}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default UserPasswordTab
