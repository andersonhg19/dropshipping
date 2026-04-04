/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Card, CardContent, Divider, MenuItem, SelectChangeEvent, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import UserAtom from '@states/UserAtom'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

import { type FilialSchemaType, filialSchema } from '@core/validations/filial-schema'

import CustomEditSelectFormControl from '@components/atoms/custom-edit-select-form-control'
import CustomEditTextField from '@components/atoms/custom-edit-text-field'
import CustomLoading from '@components/atoms/custom-loading'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'
import { useSaveEdit } from '@hooks/use-save-edit'
import { useValidator } from '@hooks/use-validation'

import { GetAllCompany } from '@api/admin/company/get-all-company-api'
import { SaveFilialApi } from '@api/admin/filial/save-filial-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { SaveFilialOutputInterface } from '@interfaces/output/admin/save-filial-output-interface'
import {
  CompanyDetailsResponse,
  GetAllCompanyResponseInterface,
} from '@interfaces/response/admin/get-all-company-response-interface'
import { FilialsDetailsResponse } from '@interfaces/response/admin/get-all-filial-response-interface'
import {
  FilialSaveDetailsResponse,
  SaveFilialResponseInterface,
} from '@interfaces/response/admin/save-filial-response-interface'


interface FilialGeneralEditFormProps {
  filialData: FilialsDetailsResponse | null
  setFilialData: (value: FilialsDetailsResponse | null) => void
  onSaveAndExit: () => void
  activeForPage: boolean
}

const FilialGeneralEditForm: React.FC<FilialGeneralEditFormProps> = ({
  filialData,
  setFilialData,
  onSaveAndExit,
  activeForPage,
}) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const [user] = useAtom(UserAtom)
  const { cardBgColor, cardBorderColor, buttonBgColor, buttonTextColor } = usePaletteVars()
  const { showError, showSuccess, showWarn } = useToast()

  const mapFilialsDetailsToSaveDetails = useCallback(
    (data: FilialsDetailsResponse | null): FilialSaveDetailsResponse | null => {
      if (!data) return null
      return {
        id: typeof data.id === 'number' ? data.id : 0,
        name: data.name ?? '',
        nit: data.nit ?? '',
        address: data.address ?? '',
        legalRepresentative: data.legalRepresentative ?? '',
        phone: data.phone ?? '',
        email: data.email ?? '',
        idCompany: Number(data.idCompany) || 0,
        companyName: data.companyName ?? '',
        image: data.image ?? '',
        active: typeof data.active === 'boolean' ? data.active : true,
        idModifiedBy: Number(user?.id) || 0,
        modifiedBy: `${user?.name ?? ''} ${user?.lastName ?? ''}`,
      }
    },
    [user]
  )

  const [filial, setFilial] = useState<FilialSaveDetailsResponse | null>(mapFilialsDetailsToSaveDetails(filialData))
  const [companyOptions, setCompanyOptions] = useState<CompanyDetailsResponse[] | null>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const { errors, validateAll, validateField, setErrors } = useValidator<FilialSchemaType>(filialSchema, {
    translate: (msg) => t(msg),
  })

  // Helper para construir objeto a validar
  const buildValuesForValidation = (override?: Partial<FilialSchemaType>): FilialSchemaType => ({
    id: filial?.id,
    idCompany: Number(filial?.idCompany || 0),
    name: filial?.name ?? '',
    nit: filial?.nit ?? '',
    address: filial?.address ?? null,
    legalRepresentative: filial?.legalRepresentative ?? null,
    phone: filial?.phone ?? null,
    email: filial?.email ?? null,
    image: filial?.image ?? null,
    active: filial?.active ?? true,
    idModifiedBy: filial?.idModifiedBy ?? undefined,
    companyName: filial?.companyName ?? null,
    modifiedBy: filial?.modifiedBy ?? null,
    ...override,
  })

  const validateOne = (field: keyof FilialSchemaType & string, value: any) => {
    const all = buildValuesForValidation({ [field]: value } as any)
    validateField(field, value, all)
  }

  // Cargar compañías
  const dataInitCompany: GetAllCompanyOutputInterface = useMemo(
    () => ({ id: '', size: 1000, page: 0, name: '', nit: '', active: true }),
    []
  )

  const { fetchData: fetchCompany } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    dataInitCompany,
    (response) => setCompanyOptions(response?.object?.list ?? []),
    'company',
    GetAllCompany as (params: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? null)
      if (err) showError(err)
    }
  )

  useEffect(() => {
    fetchCompany()
  }, [])

  const preHandleSaveEdit = () => {
    const check = validateAll(buildValuesForValidation())
    if (!check.ok) {
      // Antes: Snackbar con warning
      showWarn(t('lbl_complete_all_fields'))
      return
    }
    setErrors({})
    handleSaveEdit()
  }

  const dataSave: SaveFilialOutputInterface = {
    id: filial?.id ?? '',
    name: filial?.name ?? '',
    idCompany: filial?.idCompany ?? '',
    idModifiedBy: '',
    nit: filial?.nit ?? '',
    address: filial?.address ?? '',
    legalRepresentative: filial?.legalRepresentative ?? '',
    phone: filial?.phone ?? '',
    email: filial?.email ?? '',
    image: filial?.image ?? '',
    active: Boolean(filial?.active),
  }

  const { handleSaveEdit } = useSaveEdit<SaveFilialOutputInterface, SaveFilialResponseInterface>(
    SaveFilialApi as (params: SaveFilialOutputInterface) => Promise<SaveFilialResponseInterface>,
    (response: SaveFilialResponseInterface) => {
      setFilial(response?.object ?? null)
      setFilialData(response?.object ?? null)
      showSuccess(t('lbl_save_success'))
      onSaveAndExit()
    },
    'filial',
    setLoading,
    (err: any) => {
      if (err) {
        showError(typeof err === 'string' ? err : t('lbl_error_unexpected'))
      }
    },
    t,
    dataSave
  )

  const handleExit = () => {
    setFilialData(null)
    setFilial(null)
  }

  useEffect(() => {
    setFilial(mapFilialsDetailsToSaveDetails(filialData))
  }, [filialData, mapFilialsDetailsToSaveDetails])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    setFilial((prev: any) => (prev ? { ...prev, [name as string]: value } : null))
    validateOne(name as keyof FilialSchemaType & string, value)
  }

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target as { name?: string; value: unknown }

    setFilial((prev: any) => {
      if (!prev) return prev
      if (name === 'idCompany') {
        const num = value === '' ? 0 : Number(value)
        validateOne('idCompany', num)
        return { ...prev, idCompany: num }
      }
      if (name === 'active') {
        const bool = String(value) === 'true'
        validateOne('active', bool)
        return { ...prev, active: bool }
      }
      validateOne(name as keyof FilialSchemaType & string, value as string)
      return { ...prev, [name as string]: value as string }
    })
  }

  if (error) {
    console.error('Error filial edit:', error)
  }

  return (
    <>
      {filial && (
        <Card
          sx={{
            background: cardBgColor,
            borderRadius: muiTheme.shape.borderRadius,
            boxShadow: muiTheme.shadows[3],
            border: `1px solid ${cardBorderColor}`,
            mt: 2,
          }}
        >
          <CardContent>
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditTextField
                  label={t('lbl_id')}
                  name="id"
                  value={filial?.id ?? ''}
                  onChange={handleChange}
                  disabled
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditSelectFormControl
                  label={t('lbl_company')}
                  name="idCompany"
                  value={filial?.idCompany ?? ''}
                  onChange={handleSelectChange}
                  error={Boolean(errors.idCompany)}
                  helperText={errors.idCompany}
                >
                  {companyOptions?.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomEditSelectFormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditTextField
                  label={t('lbl_name')}
                  name="name"
                  value={filial?.name ?? ''}
                  onChange={handleChange}
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
                  value={filial?.nit ?? ''}
                  onChange={handleChange}
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
                  value={filial?.address ?? ''}
                  onChange={handleChange}
                  onBlur={(e) => validateOne('address', e.target.value)}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                  inputProps={{ maxLength: 200 }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditTextField
                  label={t('lbl_legalRepresentative')}
                  name="legalRepresentative"
                  value={filial?.legalRepresentative ?? ''}
                  onChange={handleChange}
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
                  value={filial?.phone ?? ''}
                  onChange={handleChange}
                  onBlur={(e) => validateOne('phone', e.target.value)}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  inputProps={{ inputMode: 'numeric', pattern: '\\d*' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditTextField
                  label={t('lbl_email')}
                  name="email"
                  value={filial?.email ?? ''}
                  onChange={handleChange}
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
                    value={filial?.active ? 'true' : 'false'}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="true">{t('lbl_active')}</MenuItem>
                    <MenuItem value="false">{t('lbl_inactive')}</MenuItem>
                  </CustomEditSelectFormControl>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ marginTop: 2, marginBottom: 1 }} />

      <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FancyButton
            label={t('btn_save')}
            variant="primary"
            onClick={preHandleSaveEdit}
            className="h-14 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FancyButton
            label={t('btn_exit')}
            variant="primary"
            onClick={handleExit}
            className="h-14 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          />
        </Grid>
      </Grid>

      {loading && <CustomLoading />}
    </>
  )
}

export default FilialGeneralEditForm
