'use client'

import React, { useState } from 'react'

import { Typography } from '@mui/material'
import Grid2 from '@mui/material/Grid'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import UserAtom from '@states/UserAtom'
import { motion } from 'framer-motion'
import { useSetAtom } from 'jotai'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import Input from '@components/atoms/Input'
import Label from '@components/atoms/Label'
import CustomLoader from '@components/atoms/custom-loading/custom-loading'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { normalizeKey, setUserPrivileges } from '@utils/utilities'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { Login } from '@api/admin/auth/login'
import { GetPagesTypeUser } from '@api/admin/page/get-pages-type-user-all'

import { GetAllPagesTypeUserResponseInterface } from '@interfaces/response/admin/get-all-pages-type-user-response-interface'
import { LoginUserResponseInterface } from '@interfaces/response/admin/login-user-response-interface'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useTranslation()
  const setUser = useSetAtom(UserAtom)
  const [loading, setLoading] = useState(false)

  const { showSuccess, showWarn, showError } = useToast()
  const muiTheme = useMuiTheme()
  const { textColor, textSecondaryColor, buttonBgColor, buttonTextColor } = usePaletteVars()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = (await Login(email, password)) as LoginUserResponseInterface

      if (response.correct && response.object !== null) {
        setUser(response.object)

        showSuccess(t('msj_login_success') || 'Inicio de sesión exitoso', t('lbl_login') || 'Login')

        // Cargar privilegios
        const idTypeUser = response.object.idTypeUser
        const privilegesResp = (await GetPagesTypeUser({
          id: '',
          idPage: '',
          idTypeUser: String(idTypeUser ?? ''),
          idModifiedBy: '',
          canCreate: null,
          canUpdate: null,
          canDelete: null,
          canRead: null,
          active: true,
          size: 50,
          page: 0,
        })) as GetAllPagesTypeUserResponseInterface

        if (privilegesResp?.correct && privilegesResp?.object?.list) {
          const normalized = (privilegesResp.object.list || []).map((p) => ({
            npage: normalizeKey(p.npage),
            pageName: p.pageName,
            canRead: p.canRead,
            canCreate: p.canCreate,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
            active: p.active,
            id: p.id,
            idPage: p.idPage ?? undefined,
            idTypeUser: p.idTypeUser ?? undefined,
            typeUserName: p.typeUserName,
          }))
          setUserPrivileges(normalized)
        } else {
          setUserPrivileges([])
          showWarn(
            t('msj_permissions_not_loaded') || 'No se pudieron cargar privilegios de usuario.',
            t('lbl_permissions') || 'Permisos'
          )
          console.warn('No se pudieron cargar privilegios de usuario.')
        }

        router.push('/dashboard')
      } else {
        const rawMsg = response.message || t('msj_Incorrect_credentials_try_again')
        // Si el backend envía claves traducibles en <clave>, extraer y traducir
        const keyMatch = typeof rawMsg === 'string' && rawMsg.match(/^<(.+?)>$/)
        const i18nKey = keyMatch ? keyMatch[1] : rawMsg
        const msg = t(i18nKey, { defaultValue: rawMsg })
        setError(msg)
        showError(msg, t('lbl_login') || 'Login')
        setLoading(false)
      }
    } catch {
      const msg = t('msj_Incorrect_credentials_try_again')
      setError(msg)
      showError(msg, t('lbl_login') || 'Login')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    borderRadius: muiTheme.shape.borderRadius,
    border: `1px solid ${muiTheme.palette.divider}`,
    background: muiTheme.palette.background.paper,
    color: textColor,
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    marginTop: muiTheme.spacing(0.5),
    marginBottom: muiTheme.spacing(1),
  } as React.CSSProperties

  const labelStyle = {
    color: textSecondaryColor,
    fontWeight: 500,
    fontSize: '1rem',
    marginBottom: muiTheme.spacing(0.5),
    display: 'block',
  } as React.CSSProperties

  const errorStyle = {
    color: muiTheme.palette.error.main,
    textAlign: 'center' as const,
    fontSize: '0.95rem',
    fontWeight: 500,
    marginTop: muiTheme.spacing(1),
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          width: '100%',
        }}
      >
        <CustomLoader />
      </div>
    )
  }

  return (
    <Grid2
      container
      component="form"
      onSubmit={(e) => {
        e.preventDefault()
        handleLogin()
      }}
      spacing={{ xs: 2, sm: 3 }}
    >
      {/* Email */}
      <Grid2 size={{ xs: 12 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Label htmlFor="email" text={t('lbl_email')} style={labelStyle} />
          <Input
            type="email"
            name="email"
            placeholder={t('msj_enter_your_email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autocomplete="email"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = buttonBgColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = muiTheme.palette.divider)}
            aria-label={t('lbl_email')}
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error-message' : undefined}
          />
        </motion.div>
      </Grid2>

      {/* Password */}
      <Grid2 size={{ xs: 12 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Label htmlFor="password" text={t('lbl_password')} style={labelStyle} />
          <Input
            type="password"
            name="password"
            placeholder={t('msj_enter_your_password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autocomplete="off"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = buttonBgColor)}
            onBlur={(e) => (e.currentTarget.style.borderColor = muiTheme.palette.divider)}
            aria-label={t('lbl_password')}
            aria-invalid={!!error}
            aria-describedby={error ? 'login-error-message' : undefined}
          />
        </motion.div>
      </Grid2>

      {/* Error (accesible, además del toast) */}
      {error && (
        <Grid2 size={{ xs: 12 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Typography id="login-error-message" role="alert" aria-live="assertive" style={errorStyle}>{error}</Typography>
          </motion.div>
        </Grid2>
      )}

      {/* Button */}
      <Grid2 size={{ xs: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <FancyButton
            label={t('lbl_login')}
            onClick={handleLogin}
            disabled={loading}
            className="h-14 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
            style={{
              background: buttonBgColor,
              color: buttonTextColor,
              padding: muiTheme.spacing(1.5, 2),
              fontWeight: 600,
              fontSize: '1.08rem',
              letterSpacing: '0.02em',
              boxShadow: muiTheme.shadows[2],
              marginTop: muiTheme.spacing(1),
              opacity: loading ? 0.8 : 1,
              pointerEvents: loading ? 'none' : 'auto',
            }}
          />
        </motion.div>
      </Grid2>
    </Grid2>
  )
}

export default LoginForm
