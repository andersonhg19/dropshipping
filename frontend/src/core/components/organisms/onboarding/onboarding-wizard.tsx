'use client'

import React, { useState, useCallback } from 'react'

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import {
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { SavePublishChannelApi } from '@api/commerce/publish-channel/save-publish-channel-api'
import { SaveSupplierApi } from '@api/acquisition/supplier/save-supplier-api'

const APPLE_BLUE = '#0071e3'
const TOTAL_STEPS = 4

interface OnboardingWizardProps {
  onComplete: () => void
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 2 - WooCommerce channel
  const [channelForm, setChannelForm] = useState({
    siteUrl: '',
    consumerKey: '',
    consumerSecret: '',
  })

  // Step 3 - Supplier
  const [supplierForm, setSupplierForm] = useState({
    name: 'CJ Dropshipping',
    type: 'DROPSHIPPING',
    country: 'China',
    contactInfo: '',
  })

  const goNext = useCallback(() => {
    setDirection(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }, [])

  const handleSkipWizard = useCallback(() => {
    onComplete()
  }, [onComplete])

  const handleSaveChannel = useCallback(async () => {
    setSaving(true)
    try {
      await SavePublishChannelApi({
        name: 'WooCommerce Principal',
        type: 'WOOCOMMERCE',
        status: 'INACTIVE',
        apiUrl: channelForm.siteUrl,
        apiKey: channelForm.consumerKey,
        apiSecret: channelForm.consumerSecret,
        active: true,
        idCompany: 1,
        idSubsidiary: 1,
        idModifiedBy: 1,
      })
    } catch {
      // Non-blocking: continue even if save fails
    } finally {
      setSaving(false)
      goNext()
    }
  }, [channelForm, goNext])

  const handleSaveSupplier = useCallback(async () => {
    setSaving(true)
    try {
      await SaveSupplierApi({
        name: supplierForm.name,
        type: supplierForm.type,
        country: supplierForm.country,
        contactInfo: supplierForm.contactInfo,
        shippingDaysMin: 7,
        shippingDaysMax: 20,
        active: true,
        idCompany: 1,
        idSubsidiary: 1,
        idModifiedBy: 1,
      })
    } catch {
      // Non-blocking
    } finally {
      setSaving(false)
      goNext()
    }
  }, [supplierForm, goNext])

  const handleFinish = useCallback(
    (href?: string) => {
      onComplete()
      if (href) router.push(href)
    },
    [onComplete, router],
  )

  const progress = (step / TOTAL_STEPS) * 100

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255,255,255,0.06)',
      fontSize: 14,
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
      '&.Mui-focused fieldset': { borderColor: APPLE_BLUE },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    '& .MuiInputLabel-root.Mui-focused': { color: APPLE_BLUE },
    '& .MuiOutlinedInput-input': { color: '#fff' },
  }

  const renderStep = () => {
    switch (step) {
      /* ─── Step 1: Bienvenido ─── */
      case 1:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${APPLE_BLUE}, #5ac8fa)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <RocketLaunchOutlinedIcon sx={{ color: '#fff', fontSize: 36 }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: 28, sm: 34 },
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
              }}
            >
              Bienvenido a VISNEX
            </Typography>
            <Typography
              sx={{
                fontSize: 16,
                color: 'rgba(255,255,255,0.65)',
                mt: 1,
                fontWeight: 500,
              }}
            >
              Tu plataforma de dropshipping automatizado
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                mt: 2.5,
                maxWidth: 380,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Importa productos de proveedores globales, enriquecelos con inteligencia artificial
              y publicalos en tu tienda WooCommerce en minutos.
            </Typography>
            <Button
              onClick={goNext}
              variant="contained"
              sx={{
                mt: 4,
                px: 5,
                py: 1.4,
                borderRadius: '14px',
                fontSize: 15,
                fontWeight: 600,
                textTransform: 'none',
                background: APPLE_BLUE,
                boxShadow: `0 4px 14px ${APPLE_BLUE}55`,
                '&:hover': { background: '#005bb5', boxShadow: `0 6px 20px ${APPLE_BLUE}66` },
              }}
            >
              Comenzar
            </Button>
          </Box>
        )

      /* ─── Step 2: Configura tu tienda ─── */
      case 2:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <StorefrontOutlinedIcon sx={{ color: APPLE_BLUE, fontSize: 26 }} />
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Configura tu tienda
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', mb: 3 }}>
              Conecta tu tienda WordPress / WooCommerce para publicar productos directamente.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="URL del sitio"
                placeholder="https://mitienda.com"
                size="small"
                fullWidth
                value={channelForm.siteUrl}
                onChange={(e) => setChannelForm((f) => ({ ...f, siteUrl: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Consumer Key"
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxx"
                size="small"
                fullWidth
                value={channelForm.consumerKey}
                onChange={(e) => setChannelForm((f) => ({ ...f, consumerKey: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Consumer Secret"
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxx"
                size="small"
                fullWidth
                type="password"
                value={channelForm.consumerSecret}
                onChange={(e) => setChannelForm((f) => ({ ...f, consumerSecret: e.target.value }))}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
              <Button
                onClick={goNext}
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  '&:hover': { color: 'rgba(255,255,255,0.7)', background: 'transparent' },
                }}
              >
                Configurar despues
              </Button>
              <Button
                onClick={handleSaveChannel}
                disabled={saving}
                variant="contained"
                sx={{
                  px: 3.5,
                  py: 1.2,
                  borderRadius: '12px',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: APPLE_BLUE,
                  boxShadow: `0 4px 14px ${APPLE_BLUE}55`,
                  '&:hover': { background: '#005bb5' },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {saving ? 'Guardando...' : 'Guardar y continuar'}
              </Button>
            </Box>
          </Box>
        )

      /* ─── Step 3: Tu primer proveedor ─── */
      case 3:
        return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <LocalShippingOutlinedIcon sx={{ color: '#34c759', fontSize: 26 }} />
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                Tu primer proveedor
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', mb: 3 }}>
              Agrega tu primer proveedor de productos. Puedes agregar mas despues.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                size="small"
                fullWidth
                value={supplierForm.name}
                onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))}
                sx={inputSx}
              />
              <Select
                value={supplierForm.type}
                onChange={(e) => setSupplierForm((f) => ({ ...f, type: e.target.value }))}
                size="small"
                fullWidth
                sx={{
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontSize: 14,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: APPLE_BLUE },
                  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '12px',
                      mt: 0.5,
                      background: '#1c1c1e',
                      '& .MuiMenuItem-root': { color: '#fff', fontSize: 14 },
                      '& .MuiMenuItem-root:hover': { background: 'rgba(255,255,255,0.08)' },
                    },
                  },
                }}
              >
                <MenuItem value="DROPSHIPPING">Dropshipping</MenuItem>
                <MenuItem value="WHOLESALE">Mayorista</MenuItem>
                <MenuItem value="MANUFACTURER">Fabricante</MenuItem>
                <MenuItem value="MARKETPLACE">Marketplace</MenuItem>
              </Select>
              <TextField
                label="Pais"
                size="small"
                fullWidth
                value={supplierForm.country}
                onChange={(e) => setSupplierForm((f) => ({ ...f, country: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Contacto (email o web)"
                size="small"
                fullWidth
                placeholder="soporte@proveedor.com"
                value={supplierForm.contactInfo}
                onChange={(e) => setSupplierForm((f) => ({ ...f, contactInfo: e.target.value }))}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
              <Button
                onClick={goNext}
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  textTransform: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  '&:hover': { color: 'rgba(255,255,255,0.7)', background: 'transparent' },
                }}
              >
                Configurar despues
              </Button>
              <Button
                onClick={handleSaveSupplier}
                disabled={saving}
                variant="contained"
                sx={{
                  px: 3.5,
                  py: 1.2,
                  borderRadius: '12px',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: APPLE_BLUE,
                  boxShadow: `0 4px 14px ${APPLE_BLUE}55`,
                  '&:hover': { background: '#005bb5' },
                  '&:disabled': { opacity: 0.6 },
                }}
              >
                {saving ? 'Guardando...' : 'Guardar y continuar'}
              </Button>
            </Box>
          </Box>
        )

      /* ─── Step 4: Listo! ─── */
      case 4:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #34c759, #30d158)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <CheckCircleOutlineIcon sx={{ color: '#fff', fontSize: 40 }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: 26, sm: 30 },
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Todo listo para empezar
            </Typography>
            <Typography
              sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', mt: 1, mb: 4 }}
            >
              Tu plataforma esta configurada. Elige por donde quieres comenzar.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxWidth: 340, mx: 'auto' }}>
              {[
                {
                  label: 'Importar productos',
                  desc: 'Carga tu primer CSV o conecta un proveedor',
                  icon: CloudUploadOutlinedIcon,
                  href: '/dashboard/sources/import',
                  color: APPLE_BLUE,
                },
                {
                  label: 'Explorar proveedores',
                  desc: 'Descubre fuentes de productos globales',
                  icon: SearchOutlinedIcon,
                  href: '/dashboard/sources/suppliers',
                  color: '#af52de',
                },
                {
                  label: 'Ver dashboard',
                  desc: 'Revisa el estado general de tu tienda',
                  icon: DashboardOutlinedIcon,
                  href: '/dashboard',
                  color: '#34c759',
                },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Box
                    key={action.label}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleFinish(action.href)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleFinish(action.href)
                      }
                    }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.08)',
                        border: `1px solid ${action.color}44`,
                        transform: 'translateY(-1px)',
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${APPLE_BLUE}`,
                        outlineOffset: '2px',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `${action.color}20`,
                        flexShrink: 0,
                      }}
                    >
                      <Icon sx={{ color: action.color, fontSize: 20 }} />
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                        {action.label}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {action.desc}
                      </Typography>
                    </Box>
                  </Box>
                )
              })}
            </Box>

            <Button
              onClick={() => handleFinish('/dashboard')}
              variant="contained"
              sx={{
                mt: 4,
                px: 5,
                py: 1.4,
                borderRadius: '14px',
                fontSize: 15,
                fontWeight: 600,
                textTransform: 'none',
                background: APPLE_BLUE,
                boxShadow: `0 4px 14px ${APPLE_BLUE}55`,
                '&:hover': { background: '#005bb5', boxShadow: `0 6px 20px ${APPLE_BLUE}66` },
              }}
            >
              Ir al Dashboard
            </Button>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #000 0%, #111 50%, #1a1a2e 100%)',
        overflow: 'auto',
      }}
    >
      {/* Progress bar */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            backgroundColor: 'rgba(255,255,255,0.06)',
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${APPLE_BLUE}, #5ac8fa)`,
              transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            },
          }}
        />
      </Box>

      {/* Skip wizard */}
      <Box sx={{ position: 'absolute', top: 20, right: 28 }}>
        <Button
          onClick={handleSkipWizard}
          sx={{
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'none',
            fontSize: 13,
            fontWeight: 500,
            '&:hover': { color: 'rgba(255,255,255,0.6)', background: 'transparent' },
          }}
        >
          Omitir
        </Button>
      </Box>

      {/* Step content card */}
      <Box sx={{ width: '100%', maxWidth: 500, px: 3 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Box
              sx={{
                p: { xs: 3.5, sm: 5 },
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {renderStep()}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Step indicator dots */}
      <Box sx={{ display: 'flex', gap: 1, mt: 4 }}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <Box
            key={i}
            sx={{
              width: step === i + 1 ? 24 : 8,
              height: 8,
              borderRadius: '4px',
              background: step === i + 1 ? APPLE_BLUE : 'rgba(255,255,255,0.15)',
              transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
        ))}
      </Box>

      {/* Step label */}
      <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, mt: 1.5, fontWeight: 500 }}>
        Paso {step} de {TOTAL_STEPS}
      </Typography>
    </Box>
  )
}

export default OnboardingWizard
