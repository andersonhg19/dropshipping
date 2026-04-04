'use client'

import React, { useEffect, useState } from 'react'

import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import UserAtom from '@states/UserAtom'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

import CustomEditTextField from '@components/atoms/custom-edit-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useSaveEdit } from '@hooks/use-save-edit'

import { SaveFilialConfigApi } from '@api/admin/filial/save-filial-config-api'

import { SaveFilialConfigOutputInterface } from '@interfaces/output/admin/save-filial-config-output-interface'
import { SaveFilialConfigResponseInterface } from '@interfaces/response/admin/save-filial-config-response-interface'
import { FilialConfigDetail } from '@interfaces/response/admin/save-filial-config-response-interface'

interface FilialConfigEditModalProps {
  open: boolean
  onClose: () => void
  idCompany: string
  idSubsidiary: number
  initialData?: Partial<FilialConfigDetail> // null para nuevo
  onSuccess: () => void // Para recargar la tabla después de guardar
}

const emptyDetail = {
  id: '',
  name: '',
  value: '',
  type: '',
  active: null as boolean | null,
}

const FilialConfigEditModal: React.FC<FilialConfigEditModalProps> = ({
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
  const { showSuccess, showError } = useToast()

  const [detail, setDetail] = useState({ ...emptyDetail, ...initialData })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user] = useAtom(UserAtom)

  // Actualiza los datos iniciales al abrir modal (importante para editar)
  useEffect(() => {
    if (open) {
      setDetail({ ...emptyDetail, ...initialData })
      setError(null)
    }
  }, [open, initialData])

  // Construir objeto para la API
  const saveObject: SaveFilialConfigOutputInterface = {
    id: '',
    idCompany,
    idSubsidiary,
    idModifiedBy: user?.id ?? '',
    details: [
      {
        id: detail.id ?? '',
        type: detail.type ?? '',
        name: detail.name ?? '',
        value: detail.value ?? '',
        active: detail.active ?? true,
      },
    ],
  }

  const setData = (response: SaveFilialConfigResponseInterface) => {
    if (response?.correct) {
      setError(null)
      showSuccess(t('msg_filialConfig_saved'))
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

  const { handleSaveEdit } = useSaveEdit<SaveFilialConfigOutputInterface, SaveFilialConfigResponseInterface>(
    SaveFilialConfigApi as unknown as (
      params: SaveFilialConfigOutputInterface
    ) => Promise<SaveFilialConfigResponseInterface>,
    setData,
    'filial-config',
    setLoading,
    handleApiError,
    t,
    saveObject
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setDetail((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
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
        {detail.id ? t('lbl_edit') : t('lbl_new')} {t('lbl_filialConfig')}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1, sm: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12 }}>
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
          <Grid size={{ xs: 12 }}>
            <CustomEditTextField
              label={t('lbl_type')}
              name="type"
              value={detail.type}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={detail.active ?? false}
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
          onClick={handleSaveEdit}
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

export default FilialConfigEditModal
