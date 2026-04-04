'use client'

import React, { useEffect, useState } from 'react'

import { CardContent, Divider, MenuItem, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'

import { type CompanySchemaType, companySchema } from '@core/validations/company-schema'

import CustomEditSelectFormControl from '@components/atoms/custom-edit-select-form-control'
import CustomEditTextField from '@components/atoms/custom-edit-text-field'
import CustomLoading from '@components/atoms/custom-loading'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { getUser } from '@utils/utilities'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useSaveEdit } from '@hooks/use-save-edit'
import { useValidator } from '@hooks/use-validation'

import { SaveCompanyApi } from '@api/admin/company/save-company-api'

import { SaveCompanyOutputInterface } from '@interfaces/output/admin/save-company-output-interface'
import { CompanyDetailsResponse } from '@interfaces/response/admin/get-all-company-response-interface'
import { SaveCompanyResponseInterface } from '@interfaces/response/admin/save-company-response-interface'

interface Props {
  companyData: CompanyDetailsResponse | null
  setCompanyData: (v: CompanyDetailsResponse | null) => void
  onSaveAndExit: () => void
  activeForPage: boolean
}

const CompanyEditForm: React.FC<Props> = ({ companyData, setCompanyData, onSaveAndExit, activeForPage }) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor, buttonBgColor, buttonTextColor } = usePaletteVars()
  const { showSuccess, showError, showWarn } = useToast()

  const [entity, setEntity] = useState<CompanyDetailsResponse | null>(companyData)
  const [loading, setLoading] = useState(false)

  const idUser = Number(getUser()?.id ?? 0)

  const { errors, validateAll, validateField, setErrors } = useValidator<CompanySchemaType>(companySchema, {
    translate: (msg) => t(msg),
  })

  const buildValuesForValidation = (override?: Partial<CompanySchemaType>): CompanySchemaType => ({
    id: entity?.id,
    name: entity?.name ?? '',
    nit: entity?.nit ?? '',
    address: entity?.address ?? null,
    legalRepresentative: entity?.legalRepresentative ?? null,
    contactPerson: entity?.contactPerson ?? null,
    phone: entity?.phone ?? null,
    email: entity?.email ?? null,
    active: Boolean(entity?.active),
    idModifiedBy: idUser || undefined,
    ...override,
  })

  const validateOne = (field: keyof CompanySchemaType & string, value: any) => {
    const all = buildValuesForValidation({ [field]: value } as any)
    validateField(field, value, all)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEntity((prev) => (prev ? ({ ...prev, [name]: value } as any) : prev))
    validateOne(name as keyof CompanySchemaType & string, value)
  }

  const handleSelectChange = (e: any) => {
    const v = String(e.target.value ?? '')
    const nextVal = v === 'true'

    setEntity((prev) => (prev ? { ...prev, active: nextVal } : prev))
    validateOne('active', nextVal)
  }

  const preSave = () => {
    const check = validateAll(buildValuesForValidation())
    if (!check.ok) {
      showWarn(t('lbl_complete_all_fields'))
      return
    }
    setErrors({})
    handleSaveEdit()
  }

  const payload: SaveCompanyOutputInterface = {
    id: entity?.id ?? '',
    name: entity?.name ?? '',
    nit: entity?.nit ?? '',
    address: entity?.address ?? '',
    legalRepresentative: entity?.legalRepresentative ?? '',
    contactPerson: entity?.contactPerson ?? '',
    phone: entity?.phone ?? '',
    email: entity?.email ?? '',
    active: Boolean(entity?.active),
    idModifiedBy: idUser,
  }

  const { handleSaveEdit } = useSaveEdit<SaveCompanyOutputInterface, SaveCompanyResponseInterface>(
    SaveCompanyApi as (p: SaveCompanyOutputInterface) => Promise<SaveCompanyResponseInterface>,
    (resp) => {
      if (resp?.object) setEntity(resp.object as any)
      showSuccess(t('lbl_save_success'))
      onSaveAndExit()
    },
    'company',
    setLoading,
    (err) => {
      const msg = err ?? t('lbl_error_unexpected')
      showError(msg)
    },
    t,
    payload
  )

  const handleExit = () => {
    setCompanyData(null)
    setEntity(null)
  }

  useEffect(() => {
    setEntity(companyData)
  }, [companyData])

  return (
    <>
      {entity && (
        <CardContent
          sx={{
            background: cardBgColor,
            borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
            border: `1px solid ${cardBorderColor}`,
            mb: { xs: 1.5, sm: 2 },
            p: { xs: 1.5, sm: 2 },
          }}
        >
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_name')}
                name="name"
                value={entity.name}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('name', e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                inputProps={{ maxLength: 150 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_nit')}
                name="nit"
                value={entity.nit}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('nit', e.target.value)}
                error={Boolean(errors.nit)}
                helperText={errors.nit}
                inputProps={{ maxLength: 20, pattern: '[A-Za-z0-9.\\-]+' }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_address')}
                name="address"
                value={entity.address}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('address', e.target.value)}
                error={Boolean(errors.address)}
                helperText={errors.address}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_contactPerson')}
                name="contactPerson"
                value={entity.contactPerson}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('contactPerson', e.target.value)}
                error={Boolean(errors.contactPerson)}
                helperText={errors.contactPerson}
                inputProps={{ maxLength: 150 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_legalRepresentative')}
                name="legalRepresentative"
                value={entity.legalRepresentative}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('legalRepresentative', e.target.value)}
                error={Boolean(errors.legalRepresentative)}
                helperText={errors.legalRepresentative}
                inputProps={{ maxLength: 150 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_phone')}
                name="phone"
                value={entity.phone}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('phone', e.target.value)}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                inputProps={{ inputMode: 'numeric', pattern: '\\d*' }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_mail')}
                name="email"
                value={entity.email}
                onChange={handleInputChange}
                onBlur={(e) => validateOne('email', e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                type="email"
              />
            </Grid>

            {activeForPage && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditSelectFormControl
                  label={t('lbl_status')}
                  name="active"
                  value={entity.active ? 'true' : 'false'}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="true">{t('lbl_active')}</MenuItem>
                  <MenuItem value="false">{t('lbl_inactive')}</MenuItem>
                </CustomEditSelectFormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      )}

      <Divider sx={{ my: 1 }} />

      <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FancyButton
            label={t('btn_save')}
            variant="primary"
            onClick={preSave}
            className="w-full"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FancyButton
            label={t('btn_exit')}
            variant="primary"
            onClick={handleExit}
            className="w-full"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          />
        </Grid>
      </Grid>

      {loading && <CustomLoading />}
    </>
  )
}

export default CompanyEditForm
