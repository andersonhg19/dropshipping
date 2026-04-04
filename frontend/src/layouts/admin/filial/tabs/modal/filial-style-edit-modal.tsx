'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import UserAtom from '@states/UserAtom'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

import CustomEditTextField from '@components/atoms/custom-edit-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { useFilialStyleContext } from '@hooks/context/filial-style-context'
import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useSaveEdit } from '@hooks/use-save-edit'

import { SaveFilialStyleApi } from '@api/admin/filial/save-filial-style-api'

import { isValidPaletteVarName } from '@core/constants/palette-var-names'

import { SaveFilialStyleOutputInterface } from '@interfaces/output/admin/save-filial-style-output-interface'
import { SaveFilialStyleResponseInterface } from '@interfaces/response/admin/save-filial-style-response-interface'
import { FilialStyleDetail } from '@interfaces/response/admin/save-filial-style-response-interface'

interface FilialStyleEditModalProps {
  open: boolean
  onClose: () => void
  idCompany: string
  idSubsidiary: number
  initialData?: Partial<FilialStyleDetail>
  onSuccess: () => void
}

const emptyDetail: Partial<FilialStyleDetail> = {
  id: '',
  name: '',
  value: '',
  type: '',
  typeValue: '',
  active: false,
}

const FilialStyleEditModal: React.FC<FilialStyleEditModalProps> = ({
  open,
  onClose,
  idCompany,
  idSubsidiary,
  initialData,
  onSuccess,
}) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { buttonBgColor, buttonTextColor } = usePaletteVars()
  const { refreshStyles } = useFilialStyleContext()
  const [user] = useAtom(UserAtom)
  const { showSuccess, showError } = useToast()

  const [detail, setDetail] = useState({ ...emptyDetail, ...initialData })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refresca campos cuando abres (nuevo o editar)
  useEffect(() => {
    if (open) {
      setDetail({ ...emptyDetail, ...(initialData ?? {}) })
      setError(null)
    }
  }, [open, initialData])

  // Construir objeto para la API
  const saveObject: SaveFilialStyleOutputInterface = {
    id: '',
    idCompany,
    idSubsidiary,
    idModifiedBy: user?.id ?? '',
    details: [
      {
        id: detail.id ?? '',
        name: detail.name ?? '',
        value: detail.value ?? '',
        type: detail.type ?? '',
        typeValue: detail.typeValue ?? '',
        active: detail.active ?? true,
      },
    ],
  }

  const setData = (response: SaveFilialStyleResponseInterface) => {
    if (response?.correct) {
      setError(null)
      showSuccess(t('msg_filialStyle_saved'))
      refreshStyles()
      onSuccess()
      onClose()
    } else {
      const msg = response?.message || t('lbl_error_unexpected')
      setError(msg)
      showError(msg)
    }
  }

  const handleApiError = (err: any) => {
    const msg = typeof err === 'string' ? err : t('lbl_error_unexpected')
    setError(msg)
    showError(msg)
  }

  const validateBeforeSave = useCallback(() => {
    const name = (detail.name ?? '').trim()
    if (!name) {
      setError(t('lbl_name') + ' ' + (t('lbl_required', 'es requerido') || 'es requerido'))
      showError(t('lbl_name') + ' ' + (t('lbl_required', 'es requerido') || 'es requerido'))
      return false
    }
    if (!isValidPaletteVarName(name)) {
      const msg = t('msg_filialStyle_invalid_token', 'El nombre debe ser un token válido (ej: cardBgColor, buttonBgColor). Consulte la lista de estilos predefinidos.')
      setError(msg)
      showError(msg)
      return false
    }
    return true
  }, [detail.name, t, showError])

  const handleSaveClick = () => {
    setError(null)
    if (!validateBeforeSave()) return
    handleSaveEdit()
  }

  const { handleSaveEdit } = useSaveEdit<SaveFilialStyleOutputInterface, SaveFilialStyleResponseInterface>(
    SaveFilialStyleApi as unknown as (
      params: SaveFilialStyleOutputInterface
    ) => Promise<SaveFilialStyleResponseInterface>,
    setData,
    'filial-style',
    setLoading,
    handleApiError,
    t,
    saveObject
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setDetail((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: '90vh' },
            m: { xs: 0, sm: 2 },
          },
        },
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, py: { xs: 1.5, sm: 2 } }}>
        {detail.id ? t('lbl_edit') : t('lbl_new')} {t('lbl_filialStyle')}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomEditTextField
              label={t('lbl_name')}
              name="name"
              value={detail.name}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomEditTextField
              label={t('lbl_value')}
              name="value"
              value={detail.value}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomEditTextField
              label={t('lbl_type')}
              name="type"
              value={detail.type}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomEditTextField
              label={t('lbl_typeValue')}
              name="typeValue"
              value={detail.typeValue}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(detail.active)}
                  onChange={handleChange}
                  name="active"
                  color="primary"
                  disabled={loading}
                />
              }
              label={t('lbl_active')}
            />
          </Grid>
        </Grid>
        {error && <div style={{ color: muiTheme.palette.error.main, marginTop: 12 }}>{error}</div>}
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
          onClick={onClose}
          variant="primary"
          disabled={loading}
          label={t('btn_cancel')}
          sx={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            width: { xs: '100%', sm: 'auto' },
            flex: { xs: 'none', sm: 1 },
            m: { xs: 0, sm: '0 5px 0 0' },
          }}
        />
        <FancyButton
          onClick={handleSaveClick}
          variant="primary"
          disabled={loading}
          label={t('btn_save')}
          sx={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            width: { xs: '100%', sm: 'auto' },
            flex: { xs: 'none', sm: 1 },
            m: { xs: 0, sm: '0 5px 0 0' },
          }}
        />
      </DialogActions>
    </Dialog>
  )
}

export default FilialStyleEditModal
