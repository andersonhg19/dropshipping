'use client'

import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { BarChart, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

import CustomLoader from '@components/atoms/custom-loading/custom-loading'
import FancyButton from '@components/atoms/fancy-button/fancy-button'
import SimpleFooterPrimary from '@components/molecules/simple-footer-primary'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

const HomePage: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const muiTheme = useTheme()
  const [loading, setLoading] = useState(false)

  const { textColor, textSecondaryColor, cardBgColor, buttonBgColor, buttonTextColor, iconColor, overlayGradient } =
    usePaletteVars()

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 800) // simula carga inicial de 800ms
    return () => clearTimeout(timeout)
  }, [])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          background: cardBgColor,
        }}
      >
        <CustomLoader />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        background: cardBgColor,
        overflow: 'hidden',
      }}
    >
      {/* Contenido principal con flex-grow para ocupar el espacio disponible */}
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        sx={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 2,
        }}
      >
        <Grid
          size={{ xs: 12, md: 6, lg: 6 }}
          display="flex"
          justifyContent={{ xs: 'center', md: 'flex-end' }}
          alignItems="center"
          className="relative z-10"
          sx={{
            overflow: 'hidden',
            borderStartEndRadius: 50,
            borderEndEndRadius: 50,
            marginTop: 10,
          }}
        >
          <div className="overflow-hidden shadow-4xl w-full flex justify-center items-center">
            <Image
              src="/img/ImageInit.png"
              alt="CRM/ERP Dashboard"
              width={1400}
              height={800}
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '100vw',
                aspectRatio: '16/9',
                objectFit: 'cover',
              }}
              className="rounded-lg"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background: overlayGradient,
                borderRadius: muiTheme.shape.borderRadius,
                opacity: 0.3,
              }}
            />
          </div>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 5 }} textAlign="center" className="p-4 md:pl-8">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { delay: 0.2, duration: 0.8, ease: 'easeOut' },
              },
            }}
            style={{
              color: textColor,
              fontSize: 'clamp(1.75rem, 4vw, 3.75rem)',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            {t('msj_we_innovate_for_you')}
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { duration: 0.8, ease: 'easeOut' },
              },
            }}
            style={{
              color: textSecondaryColor,
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              marginBottom: '1.5rem',
            }}
          >
            {t('msj_this_environment_has_been_designed_to_accompany_you_every_day')}
          </motion.p>

          <Grid container justifyContent={{ xs: 'center', md: 'center' }} spacing={2}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }} className="mb-4 md:mb-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <FancyButton
                  label={t('btn_login')}
                  onClick={() => router.push('/users/login')}
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                    height: '3.5rem',
                    width: '100%',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)',
                    fontWeight: 600,
                    transition: 'box-shadow 0.2s',
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>

          <Grid container spacing={2} justifyContent="center" className="mt-8">
            {[
              {
                icon: Users,
                title: t('lbl_products'),
              },
              {
                icon: BarChart,
                title: t('lbl_trending'),
              },
            ].map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { duration: 0.8, delay: 0.2 * (index + 1), ease: 'easeOut' },
                    },
                  }}
                  className="flex flex-col items-center text-center"
                  style={{ color: iconColor }}
                >
                  <feature.icon size={48} className="mb-2" style={{ color: iconColor }} />
                  <h3
                    style={{
                      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                      fontWeight: 600,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {t(feature.title)}
                  </h3>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Footer fijo en la parte inferior */}
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

export default HomePage
