'use client'

import React, { useMemo, useState } from 'react'

import {
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import UserAtom from '@states/UserAtom'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { useFilialStyleContext } from '@hooks/context/filial-style-context'
import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { SaveFilialStyleApi } from '@api/admin/filial/save-filial-style-api'

import { SaveFilialStyleOutputInterface } from '@interfaces/output/admin/save-filial-style-output-interface'
import { SaveFilialStyleResponseInterface } from '@interfaces/response/admin/save-filial-style-response-interface'

import { getPaletteTemplateList } from '@core/constants/palette-default-values'

interface FilialStyleTemplateModalProps {
  open: boolean
  onClose: () => void
  idCompany: string
  idSubsidiary: number
  existingNames: string[]
  onSuccess: () => void
}

const FilialStyleTemplateModal: React.FC<FilialStyleTemplateModalProps> = ({
  open,
  onClose,
  idCompany,
  idSubsidiary,
  existingNames,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const { buttonBgColor, buttonTextColor, cardBorderColor, textColor, textSecondaryColor } = usePaletteVars()
  const { refreshStyles } = useFilialStyleContext()
  const [user] = useAtom(UserAtom)
  const { showSuccess, showError } = useToast()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [templateVariant, setTemplateVariant] = useState<'light' | 'dark'>('light')

  const templateTokens = useMemo(() => getPaletteTemplateList(templateVariant), [templateVariant])

  const availableTokens = useMemo(() => {
    return templateTokens.filter((token) => !existingNames.includes(token.name))
  }, [templateTokens, existingNames])

  const handleToggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selected.size === availableTokens.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(availableTokens.map((t) => t.name)))
    }
  }

  const handleAddFromTemplate = async () => {
    if (selected.size === 0) return

    setLoading(true)
    try {
      const details = Array.from(selected).map((name) => {
        const token = templateTokens.find((t) => t.name === name)!
        return {
          id: '',
          name: token.name,
          value: token.value,
          type: 'color',
          typeValue: token.value.startsWith('#') ? 'hex' : 'css',
          active: true,
        }
      })

      const payload: SaveFilialStyleOutputInterface = {
        id: '',
        idCompany,
        idSubsidiary,
        idModifiedBy: user?.id ?? '',
        details,
      }

      const response = (await SaveFilialStyleApi(payload)) as SaveFilialStyleResponseInterface

      if (response?.correct) {
        showSuccess(t('msg_filialStyle_saved'))
        refreshStyles()
        onSuccess()
        onClose()
        setSelected(new Set())
      } else {
        showError(response?.message ?? t('lbl_error_unexpected'))
      }
    } catch (err) {
      showError(typeof err === 'string' ? err : t('lbl_error_unexpected'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelected(new Set())
    setTemplateVariant('light')
    onClose()
  }

  const handleTemplateVariant = (_: React.MouseEvent<HTMLElement>, next: 'light' | 'dark' | null) => {
    if (next !== null) {
      setTemplateVariant(next)
      setSelected(new Set())
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '85vh' },
            m: { xs: 0, sm: 2 },
            border: `1px solid ${cardBorderColor}`,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, py: { xs: 1.5, sm: 2 } }}>
        {t('lbl_add_from_template', 'Agregar desde plantilla')}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
        <Box sx={{ color: textColor, mb: 2 }}>
          {t('msg_filialStyle_template_help', 'Seleccione los estilos que desea agregar. Los que ya existen en la subsidiaria no aparecen aquí.')}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: textSecondaryColor, mb: 1 }}>
            {t('lbl_filialStyle_template_theme', 'Tipo de plantilla')}
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={templateVariant}
            onChange={handleTemplateVariant}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="light" sx={{ px: 2, textTransform: 'none' }}>
              {t('lbl_theme_light', 'Tema claro')}
            </ToggleButton>
            <ToggleButton value="dark" sx={{ px: 2, textTransform: 'none' }}>
              {t('lbl_theme_dark', 'Tema oscuro')}
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" sx={{ display: 'block', color: textSecondaryColor, mt: 1 }}>
            {templateVariant === 'light'
              ? t(
                  'msg_filialStyle_template_light_hint',
                  'Valores pensados para fondos claros. Si la app usa modo oscuro y ya cargó esta plantilla, los colores no conflictivos se ajustan solos.'
                )
              : t(
                  'msg_filialStyle_template_dark_hint',
                  'Valores pensados para fondos oscuros (texto claro, cards más oscuras). Úselo si la mayoría de usuarios trabaja en modo oscuro.'
                )}
          </Typography>
        </Box>

        {availableTokens.length === 0 ? (
          <Box sx={{ color: textColor, py: 2 }}>
            {t('msg_filialStyle_all_added', 'Todos los estilos predefinidos ya están configurados para esta subsidiaria.')}
          </Box>
        ) : (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selected.size === availableTokens.length && availableTokens.length > 0}
                  indeterminate={selected.size > 0 && selected.size < availableTokens.length}
                  onChange={handleSelectAll}
                />
              }
              label={t('lbl_select_all', 'Seleccionar todos')}
              sx={{ mb: 1.5 }}
            />
            <Box
              sx={{
                maxHeight: 320,
                overflowY: 'auto',
                border: `1px solid ${cardBorderColor}`,
                borderRadius: 1,
                p: 1.5,
              }}
            >
              {availableTokens.map((token) => (
                <Box
                  key={token.name}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    py: 0.75,
                    borderBottom: `1px solid ${cardBorderColor}`,
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Checkbox
                    checked={selected.has(token.name)}
                    onChange={() => handleToggle(token.name)}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box component="span" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {token.name}
                    </Box>
                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem', ml: 1 }}>
                      {token.description}
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      backgroundColor: token.value.startsWith('#') ? token.value : 'transparent',
                      border: token.value.startsWith('#') ? 'none' : `2px solid ${cardBorderColor}`,
                      flexShrink: 0,
                    }}
                    title={token.value}
                  />
                </Box>
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 1.5 },
        }}
      >
        <FancyButton
          onClick={handleClose}
          variant="primary"
          disabled={loading}
          label={t('btn_cancel')}
          sx={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            width: { xs: '100%', sm: 'auto' },
          }}
        />
        <FancyButton
          onClick={handleAddFromTemplate}
          variant="primary"
          disabled={loading || selected.size === 0}
          label={t('btn_add')}
          sx={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            width: { xs: '100%', sm: 'auto' },
          }}
        />
      </DialogActions>
    </Dialog>
  )
}

export default FilialStyleTemplateModal
