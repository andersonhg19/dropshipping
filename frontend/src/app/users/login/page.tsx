'use client'

import React, { useState } from 'react'

import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import { easeOut, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

import SimpleFooterPrimary from '@components/molecules/simple-footer-primary'
import ForgotPasswordForm from '@components/organisms/auth/forgot-password-form'
import LoginForm from '@components/organisms/auth/login-form'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

const LoginPage: React.FC = () => {
  const { t } = useTranslation()
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const { textColor, buttonBgColor } = usePaletteVars()
  const muiTheme = useMuiTheme()

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: easeOut },
    },
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  const background = 'linear-gradient(to right, rgb(152, 201, 223), rgb(136, 185, 220), rgb(44, 169, 227))'

  const cardBg = muiTheme.palette.mode === 'dark' ? muiTheme.palette.background.paper : '#fff'

  const cardShadow = muiTheme.palette.mode === 'dark' ? muiTheme.shadows[4] : muiTheme.shadows[4]

  const headingStyle = {
    color: textColor,
    textAlign: 'center' as const,
    marginBottom: muiTheme.spacing(3),
    fontWeight: 700,
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    letterSpacing: '-1px',
  }

  const linkButtonStyle = {
    color: buttonBgColor,
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
    outline: 'none',
    textDecoration: 'underline',
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        background,
        overflow: 'hidden',
      }}
    >
      <Grid2
        container
        sx={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Grid2 size={{ xs: 12, sm: 9, md: 6, lg: 4 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={{
              width: '100%',
              overflow: 'hidden',
              borderRadius: muiTheme.shape.borderRadius,
              background: cardBg,
              boxShadow: cardShadow,
              minWidth: 280,
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 5 } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {showForgotPassword ? (
                  <>
                    <h2 style={headingStyle}>{t('lbl_reset_password')}</h2>
                    <ForgotPasswordForm />
                    <Grid2 container justifyContent="center" className="mt-4">
                      <motion.button
                        onClick={() => setShowForgotPassword(false)}
                        style={linkButtonStyle}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {t('lbl_back_to_login')}
                      </motion.button>
                    </Grid2>
                  </>
                ) : (
                  <>
                    <h2 style={headingStyle}>{t('lbl_login')}</h2>
                    <LoginForm />
                    <Grid2 container justifyContent="center" className="mt-4">
                      <motion.button
                        onClick={() => setShowForgotPassword(true)}
                        style={linkButtonStyle}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        {t('msj_forgot_password')}
                      </motion.button>
                    </Grid2>
                  </>
                )}
              </motion.div>
            </Box>
          </motion.div>
        </Grid2>
      </Grid2>

      <footer
        style={{
          flexShrink: 0,
          width: '100%',
          marginTop: 'auto',
        }}
      >
        <SimpleFooterPrimary />
      </footer>
    </div>
  )
}

export default LoginPage
