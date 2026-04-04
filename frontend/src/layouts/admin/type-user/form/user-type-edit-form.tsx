'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { CardContent, Divider, MenuItem, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'

import { TypeUserSchemaType, typeUserSchema } from '@core/validations/type-user-schema'

import CustomEditSelectFormControl from '@components/atoms/custom-edit-select-form-control'
import CustomEditTextField from '@components/atoms/custom-edit-text-field'
import CustomLoading from '@components/atoms/custom-loading'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { getUser } from '@utils/utilities'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'
import { useSaveEdit } from '@hooks/use-save-edit'
import { useValidator } from '@hooks/use-validation'

import { GetAllCompany } from '@api/admin/company/get-all-company-api'
import { GetAllFilialApi } from '@api/admin/filial/get-all-filial-api'
import { SaveTypeUser } from '@api/admin/user/save-type-user-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import { SaveTypeUserOutputInterface } from '@interfaces/output/admin/save-type-user-output-interface'
import {
  CompanyDetailsResponse,
  GetAllCompanyResponseInterface,
} from '@interfaces/response/admin/get-all-company-response-interface'
import {
  FilialsDetailsResponse,
  GetAllFilialResponseInterface,
} from '@interfaces/response/admin/get-all-filial-response-interface'
import { TypeUserDTOInterface } from '@interfaces/response/admin/get-all-type-user-response-interface'
import { SaveTypeUserResponseInterface } from '@interfaces/response/admin/save-type-user-response-interface'

interface UserTypeEditFormProps {
  typeUserData: TypeUserDTOInterface | null
  setTypeUserData: (value: TypeUserDTOInterface | null) => void
  onSaveAndExit: () => void
  activeForPage?: boolean
}

const UserTypeEditForm: React.FC<UserTypeEditFormProps> = ({
  typeUserData,
  setTypeUserData,
  onSaveAndExit,
  activeForPage,
}) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor, buttonBgColor, buttonTextColor } = usePaletteVars()
  const { showError, showSuccess, showInfo } = useToast()

  const [typeUser, setTypeUser] = useState<TypeUserDTOInterface | null>(typeUserData ?? null)

  const [nameError, setNameError] = useState<any>({})
  const [loading, setLoading] = useState<boolean>(false)
  const idUser = getUser().id

  const [companyOptions, setCompanyOptions] = useState<CompanyDetailsResponse[]>([])
  const [subsidiaryOptions, setSubsidiaryOptions] = useState<FilialsDetailsResponse[]>([])

  const [form, setForm] = useState<{ company: string; subsidiary: string }>({
    company: typeUserData?.idCompany ? String(typeUserData.idCompany) : '',
    subsidiary: typeUserData?.idSubsidiary ? String(typeUserData.idSubsidiary) : '',
  })

  const { errors, validateAll, validateField, setErrors } = useValidator<TypeUserSchemaType>(typeUserSchema, {
    translate: (msg) => t(msg),
  })

  const buildValuesForValidation = (override?: Partial<TypeUserSchemaType>): TypeUserSchemaType => ({
    id: typeUser?.id ?? null,
    idCompany: form.company ? Number(form.company) : null,
    idSubsidiary: form.subsidiary ? Number(form.subsidiary) : null,
    name: typeUser?.name ?? '',
    active: typeUser?.active ?? true,
    idModifiedBy: idUser,
    ...override,
  })

  const validateOne = (field: keyof TypeUserSchemaType & string, value: any) => {
    const all = buildValuesForValidation({ [field]: value } as any)
    validateField(field, value, all)
  }

  const dataInitCompany = useMemo<GetAllCompanyOutputInterface>(
    () => ({
      id: '',
      size: 1000,
      page: 0,
      name: '',
      nit: '',
      state: true,
    }),
    []
  )

  const dataInitSubsidiary = useMemo<GetAllFilialOutputInterface>(
    () => ({
      id: null,
      name: '',
      nit: '',
      state: true,
      idCompany: form.company ? Number(form.company) : null,
      page: 0,
      size: 1000,
    }),
    [form.company]
  )

  const dataSave: SaveTypeUserOutputInterface = {
    id: Number(typeUser?.id) || null,
    name: typeUser?.name ?? '',
    active: typeUser?.active ?? true,
    idCompany: form.company ? Number(form.company) : null,
    idSubsidiary: form.subsidiary ? Number(form.subsidiary) : null,
    idModifiedBy: idUser,
  }

  const preHandleSaveEdit = () => {
    const res = validateAll(buildValuesForValidation())
    if (!res.ok) {
      showInfo(t('lbl_complete_all_fields'))
      return
    }
    setErrors({})
    handleSaveEdit()
  }

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string
    const v = String(e.target.value ?? '')

    if (name === 'company') {
      setForm((prev) => (prev.company !== v || prev.subsidiary !== '' ? { ...prev, company: v, subsidiary: '' } : prev))
      setTypeUser((prev) => (prev ? { ...prev, idCompany: v ? Number(v) : null, idSubsidiary: null } : prev))
      validateOne('idCompany', v ? Number(v) : null)
      return
    }

    if (name === 'subsidiary') {
      setForm((prev) => (prev.subsidiary !== v ? { ...prev, subsidiary: v } : prev))
      setTypeUser((prev) => (prev ? { ...prev, idSubsidiary: v ? Number(v) : null } : prev))
      validateOne('idSubsidiary', v ? Number(v) : null)
      return
    }
  }

  const handleExit = () => {
    setTypeUserData(null)
    setTypeUser(null)
  }

  const { fetchData: fetchCompany } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    dataInitCompany,
    (response) => {
      const companies = (response?.object as any)?.companyDTOList ?? (response?.object as any)?.list ?? []
      setCompanyOptions(companies)
    },
    'company',
    GetAllCompany as (params: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (error) => {
      if (error) showError(error)
    }
  )

  const { fetchData: fetchSubsidiary } = useFetchData<GetAllFilialOutputInterface, GetAllFilialResponseInterface>(
    dataInitSubsidiary,
    (response) => {
      const subs = (response?.object as any)?.list ?? []
      setSubsidiaryOptions(subs)
      setForm((prev) => {
        if (prev.subsidiary) return prev
        const first = subs[0]?.id ? String(subs[0].id) : ''
        return first !== prev.subsidiary ? { ...prev, subsidiary: first } : prev
      })
    },
    'subsidiary',
    GetAllFilialApi as unknown as (params: GetAllFilialOutputInterface) => Promise<GetAllFilialResponseInterface>,
    setLoading,
    (error) => {
      if (error) showError(error)
    }
  )

  const { handleSaveEdit } = useSaveEdit<SaveTypeUserOutputInterface, SaveTypeUserResponseInterface>(
    SaveTypeUser as (params: SaveTypeUserOutputInterface) => Promise<SaveTypeUserResponseInterface>,
    (response: SaveTypeUserResponseInterface) => {
      const sanitizeTypeUser = (obj: any): TypeUserDTOInterface | null => {
        if (!obj) return null
        return {
          ...obj,
          active: obj.active !== undefined ? obj.active : (obj.active ?? true),
        }
      }
      const sanitized = sanitizeTypeUser(response?.object)
      setTypeUser(sanitized)
      setTypeUserData(sanitized)
      showSuccess(t('lbl_save_success'))
      onSaveAndExit()
    },
    'type user',
    setLoading,
    (error: any) => {
      setNameError(error ?? '')
      if (error) {
        showError(typeof error === 'string' ? error : t('lbl_error_unexpected'))
      }
    },
    t,
    dataSave
  )

  useEffect(() => {
    fetchCompany()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (form.company) {
      fetchSubsidiary()
    } else {
      setSubsidiaryOptions((prev) => (prev.length ? [] : prev))
      setForm((prev) => (prev.subsidiary !== '' ? { ...prev, subsidiary: '' } : prev))
    }
  }, [form.company])

  return (
    <>
      {typeUser && (
        <CardContent
          sx={{
            background: cardBgColor,
            borderRadius: muiTheme.shape.borderRadius,
            border: `1px solid ${cardBorderColor}`,
            mb: 2,
          }}
        >
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_id')}
                name="id"
                value={typeUser?.id ?? ''}
                onChange={(e) => setTypeUser((prev) => (prev ? { ...prev, id: Number(e.target.value) } : null))}
                error={Boolean(nameError.id)}
                helperText={nameError.id}
                disabled={true}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditSelectFormControl
                label={t('lbl_company')}
                name="company"
                value={form.company}
                onChange={handleSelectChange as any}
                error={Boolean(nameError.company)}
                helperText={nameError.company && t('requiredField')}
              >
                <MenuItem value="">{t('lbl_select_option')}</MenuItem>
                {companyOptions.map((item) => (
                  <MenuItem key={item.id ?? ''} value={String(item.id ?? '')}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomEditSelectFormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditSelectFormControl
                label={t('lbl_filial')}
                name="subsidiary"
                value={form.subsidiary}
                onChange={handleSelectChange as any}
                error={Boolean(nameError.subsidiary)}
                helperText={nameError.subsidiary && t('requiredField')}
                disabled={!form.company}
              >
                <MenuItem value="">{t('lbl_select_option')}</MenuItem>
                {subsidiaryOptions.map((item) => (
                  <MenuItem key={item.id ?? ''} value={String(item.id ?? '')}>
                    {item.name}
                  </MenuItem>
                ))}
              </CustomEditSelectFormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <CustomEditTextField
                label={t('lbl_name')}
                name="name"
                value={typeUser?.name ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  setTypeUser((prev) => (prev ? { ...prev, name: v } : prev))
                }}
                onBlur={(e) => validateOne('name', e.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
                inputProps={{ maxLength: 150 }}
              />
            </Grid>

            {activeForPage && (
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <CustomEditSelectFormControl
                  label={t('lbl_status')}
                  name="active"
                  value={typeUser.active === true ? 'true' : 'false'}
                  onChange={(e) => {
                    const bool = (e.target as any).value === 'true'
                    setTypeUser((prev) => (prev ? { ...prev, active: bool } : null))
                    validateOne('active', bool)
                  }}
                >
                  <MenuItem value="true">{t('lbl_active')}</MenuItem>
                  <MenuItem value="false">{t('lbl_inactive')}</MenuItem>
                </CustomEditSelectFormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      )}

      <Divider sx={{ marginTop: 2, marginBottom: 1 }} />

      <Grid container justifyContent="center" alignItems="center">
        {!typeUser?.id != null && (
          <FancyButton
            label={t('btn_save')}
            variant="primary"
            onClick={() => preHandleSaveEdit()}
            style={{
              marginTop: 8,
              marginRight: 8,
              width: '30%',
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
            }}
          />
        )}
        <FancyButton
          label={t('btn_exit')}
          variant="primary"
          onClick={() => handleExit()}
          style={{
            marginTop: 8,
            marginRight: 8,
            width: '30%',
            justifyContent: 'center',
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
          }}
        />
      </Grid>

      {loading && <CustomLoading />}
    </>
  )
}

export default UserTypeEditForm
