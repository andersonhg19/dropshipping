'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Card, CardContent, Divider, MenuItem, SelectChangeEvent, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTranslation } from 'react-i18next'

import { UserSchemaType, userSchema } from '@core/validations/user-schema'

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
import { GetAllTypeUsersApi } from '@api/admin/user/get-all-type-users-api'
import { SaveUserApi } from '@api/admin/user/save-user-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import { GetAllTypeUserOutputInterface } from '@interfaces/output/admin/get-all-type-user-output-interface'
import { SaveUserOutputInterface } from '@interfaces/output/admin/save-user-output-interface'
import {
  CompanyDetailsResponse,
  GetAllCompanyResponseInterface,
} from '@interfaces/response/admin/get-all-company-response-interface'
import {
  FilialsDetailsResponse,
  GetAllFilialResponseInterface,
} from '@interfaces/response/admin/get-all-filial-response-interface'
import {
  GetAllTypeUserResponseInterface,
  TypeUserDTOInterface,
} from '@interfaces/response/admin/get-all-type-user-response-interface'
import { UserDTOInterface } from '@interfaces/response/admin/get-all-users-response-interface'
import { SaveUserResponseInterface } from '@interfaces/response/admin/save-user-response-interface'

interface UserSearchFormProps {
  userData: UserDTOInterface | null
  setUserData: (value: UserDTOInterface | null) => void
  onSaveAndExit: () => void
  activeForPage?: boolean
}

const UserEditForm: React.FC<UserSearchFormProps> = ({ userData, setUserData, activeForPage }) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor, buttonBgColor, buttonTextColor } = usePaletteVars()
  const { showError, showSuccess, showWarn } = useToast()

  const [form, setForm] = useState({
    id: userData?.id || '',
    company: userData?.idCompany ? Number(userData.idCompany) : '',
    subsidiary: userData?.idSubsidiary ? Number(userData.idSubsidiary) : '',
    typeUser: userData?.idTypeUser ? String(userData.idTypeUser) : '',
    name: userData?.name || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    dni: userData?.dni || '',
    cellphone: userData?.cellphone || '',
    active: userData?.active ?? true,
  })

  const [companyOptions, setCompanyOptions] = useState<CompanyDetailsResponse[]>([])
  const [subsidiaryOptions, setSubsidiaryOptions] = useState<FilialsDetailsResponse[]>([])
  const [typeUserOptions, setTypeUserOptions] = useState<TypeUserDTOInterface[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [user, setUser] = useState<UserDTOInterface | null>(userData)

  const [nameError, setNameError] = useState<any>({})

  const { errors, validateAll, validateField, setErrors } = useValidator<UserSchemaType>(userSchema, {
    translate: (msg) => t(msg),
  })

  const buildValuesForValidation = (override?: Partial<UserSchemaType>): UserSchemaType => ({
    id: form.id ? Number(form.id) : undefined,
    idCompany: form.company ? Number(form.company) : 0,
    idSubsidiary: form.subsidiary ? Number(form.subsidiary) : 0,
    idTypeUser: form.typeUser ? Number(form.typeUser) : 0,

    name: form.name ?? '',
    lastName: form.lastName ?? '',
    dni: form.dni ?? '',
    email: form.email ?? '',
    cellphone: form.cellphone ?? '',

    active: Boolean(form.active),
    admin: false,
    idModifiedBy: getUser() ? Number(getUser().id) : undefined,

    ...override,
  })

  const dataSave: SaveUserOutputInterface = {
    id: form.id ? Number(form.id) : 0,
    idCompany: form.company ? Number(form.company) : 0,
    idSubsidiary: form.subsidiary ? Number(form.subsidiary) : null,
    idTypeUser: form.typeUser ? Number(form.typeUser) : 0,
    name: form.name,
    lastName: form.lastName,
    email: form.email,
    dni: form.dni,
    cellphone: form.cellphone,
    active: Boolean(form.active),
    idModifiedBy: getUser() ? Number(getUser().id) : 0,
    admin: false,
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

  const dataInitTypeUser = useMemo<GetAllTypeUserOutputInterface>(
    () => ({
      id: null,
      name: '',
      idCompany: form.company ? Number(form.company) : null,
      idSubsidiary: form.subsidiary ? Number(form.subsidiary) : null,
      active: true,
      size: 1000,
      page: 0,
    }),
    [form.company, form.subsidiary]
  )

  const { fetchData: fetchCompany } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    dataInitCompany,
    (response) => {
      const companies = (response?.object as any)?.companyDTOList ?? (response?.object as any)?.list ?? []
      setCompanyOptions(companies)
    },
    'company',
    GetAllCompany as (params: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? null)
      if (err) showError(err)
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
        return first !== prev.subsidiary ? { ...prev, subsidiary: first as any } : prev
      })
    },
    'subsidiary',
    GetAllFilialApi as unknown as (params: GetAllFilialOutputInterface) => Promise<GetAllFilialResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? null)
      if (err) showError(err)
    }
  )

  const { fetchData: fetchTypeUsers } = useFetchData<GetAllTypeUserOutputInterface, GetAllTypeUserResponseInterface>(
    dataInitTypeUser,
    (response) => {
      const types = (response?.object as any)?.typeUserDTOList ?? (response?.object as any)?.list ?? []
      setTypeUserOptions(types)
      setForm((prev) => ({
        ...prev,
        typeUser: prev.typeUser || (types[0]?.id ? String(types[0].id) : ''),
      }))
    },
    'type users',
    GetAllTypeUsersApi,
    setLoading,
    (err) => {
      setError(err ?? null)
      if (err) showError(err)
    }
  )

  const preHandleSaveEdit = async () => {
    const check = validateAll(buildValuesForValidation())
    if (check.ok) {
      setErrors({})
      handleSaveEdit()
    } else {
      // Antes usabas Snackbar con warning, ahora toast
      showWarn(t('lbl_complete_all_fields'))
    }
  }

  const validateOne = (field: keyof UserSchemaType & string, value: any) => {
    const all = buildValuesForValidation({ [field]: value } as any)
    validateField(field, value, all)
  }

  const { handleSaveEdit } = useSaveEdit<SaveUserOutputInterface, SaveUserResponseInterface>(
    SaveUserApi as (params: SaveUserOutputInterface) => Promise<SaveUserResponseInterface>,
    (response: SaveUserResponseInterface) => {
      const sanitizeUser = (obj: any): UserDTOInterface | null => {
        if (!obj) return null
        return {
          ...obj,
          idModifiedBy: obj.idModifiedBy !== undefined ? Number(obj.idModifiedBy) : undefined,
        }
      }
      const sanitized = sanitizeUser(response?.object)
      setUser(sanitized)
      setUserData(sanitized)
      showSuccess(t('lbl_save_success'))
    },
    'user',
    setLoading,
    (err: any) => {
      setNameError(err ?? '')
      if (err) {
        showError(typeof err === 'string' ? err : t('lbl_error_unexpected'))
      }
    },
    t,
    dataSave
  )

  const handleExit = () => {
    setUserData(null)
    setUser(null)
  }

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target as { name: string; value: unknown }
    const v = String(value ?? '')

    if (name === 'active') {
      const isActive = v === 'true'
      setForm((prev) => ({ ...prev, active: isActive }))
      validateOne('active', isActive)
      return
    }

    setForm((prev) => {
      if (name === 'company') {
        return { ...prev, company: v, subsidiary: '', typeUser: '' }
      }
      if (name === 'subsidiary') {
        return { ...prev, subsidiary: v, typeUser: '' }
      }
      if (name === 'typeUser') {
        return { ...prev, typeUser: v }
      }
      return prev
    })
  }

  useEffect(() => {
    fetchCompany()
    fetchTypeUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (form.company) {
      fetchSubsidiary()
    } else {
      setSubsidiaryOptions((prev) => (prev.length ? [] : prev))
      setForm((prev) => (prev.subsidiary !== '' ? { ...prev, subsidiary: '' } : prev))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.company])

  return (
    <>
      {user && (
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
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditTextField
                  label={t('lbl_id')}
                  name="id"
                  value={user?.id ?? ''}
                  onChange={(e) => setUser((prevUser) => (prevUser ? { ...prevUser, id: e.target.value } : null))}
                  error={Boolean(nameError)}
                  helperText={nameError.id}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditSelectFormControl
                  label={t('lbl_company')}
                  name="company"
                  value={form.company}
                  onChange={handleSelectChange}
                  error={Boolean(nameError.company) || Boolean(error)}
                  helperText={nameError.company && t('requiredField')}
                >
                  {companyOptions?.map((item) => (
                    <MenuItem key={item.id ?? ''} value={item.id ?? ''}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomEditSelectFormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditSelectFormControl
                  label={t('lbl_filial')}
                  name="subsidiary"
                  value={form.subsidiary}
                  onChange={handleSelectChange}
                  error={Boolean(nameError.subsidiary)}
                  helperText={nameError.subsidiary && t('lbl_requiredField')}
                >
                  {subsidiaryOptions?.map((item) => (
                    <MenuItem key={item.id ?? ''} value={item.id ?? ''}>
                      {item.name}
                    </MenuItem>
                  ))}
                </CustomEditSelectFormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditTextField
                  label={t('lbl_name')}
                  name="name"
                  value={form.name}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((prev) => ({ ...prev, name: v }))
                    setUser((prev) => (prev ? { ...prev, name: v } : prev))
                    validateOne('name', v)
                  }}
                  onBlur={(e) => validateOne('name', e.target.value)}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  inputProps={{ maxLength: 150 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditTextField
                  label={t('lbl_lastName')}
                  name="lastName"
                  value={form.lastName}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((prev) => ({ ...prev, lastName: v }))
                    setUser((prev) => (prev ? { ...prev, lastName: v } : prev))
                    validateOne('lastName', v)
                  }}
                  onBlur={(e) => validateOne('lastName', e.target.value)}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  inputProps={{ maxLength: 150 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditTextField
                  label={t('lbl_dni')}
                  name="dni"
                  value={form.dni}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((prev) => ({ ...prev, dni: v }))
                    setUser((prev) => (prev ? { ...prev, dni: v } : prev))
                    validateOne('dni', v)
                  }}
                  onBlur={(e) => validateOne('dni', e.target.value)}
                  error={Boolean(errors.dni)}
                  helperText={errors.dni}
                  inputProps={{ maxLength: 20, inputMode: 'text', pattern: '[A-Za-z0-9]+' }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditTextField
                  label={t('lbl_email')}
                  name="email"
                  value={form.email}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((prev) => ({ ...prev, email: v }))
                    setUser((prev) => (prev ? { ...prev, email: v } : prev))
                    validateOne('email', v)
                  }}
                  onBlur={(e) => validateOne('email', e.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  type="email"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditTextField
                  label={t('lbl_cellphone')}
                  name="cellphone"
                  value={form.cellphone}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((prev) => ({ ...prev, cellphone: v }))
                    setUser((prev) => (prev ? { ...prev, cellphone: v } : prev))
                    validateOne('cellphone', v)
                  }}
                  onBlur={(e) => validateOne('cellphone', e.target.value)}
                  error={Boolean(errors.cellphone)}
                  helperText={errors.cellphone}
                  inputProps={{ inputMode: 'numeric', pattern: '\\d+' }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CustomEditSelectFormControl
                  label={t('lbl_typeUser')}
                  name="typeUser"
                  value={form.typeUser}
                  onChange={handleSelectChange}
                  error={Boolean(nameError.typeUser)}
                  helperText={nameError.typeUser && t('requiredField')}
                >
                  <MenuItem value="">{t('lbl_select_option')}</MenuItem>
                  {typeUserOptions.map((tu) => (
                    <MenuItem key={tu.id ?? ''} value={tu.id != null ? String(tu.id) : ''}>
                      {tu.name}
                    </MenuItem>
                  ))}
                </CustomEditSelectFormControl>
              </Grid>

              {activeForPage && (
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <CustomEditSelectFormControl
                    label={t('lbl_status')}
                    name="active"
                    value={form.active === true ? 'true' : 'false'}
                    onChange={handleSelectChange}
                    error={Boolean(nameError.active)}
                    helperText={nameError.active && t('requiredField')}
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

      <Grid container justifyContent="center" alignItems="center">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FancyButton
            label={t('btn_save')}
            variant="primary"
            onClick={preHandleSaveEdit}
            className="h-14 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
              marginTop: '10px',
              marginRight: '10px',
              display: 'flex',
              justifyContent: 'center',
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FancyButton
            label={t('btn_exit')}
            variant="primary"
            onClick={handleExit}
            className="h-14 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
            style={{
              backgroundColor: buttonBgColor,
              color: buttonTextColor,
              marginTop: '10px',
              marginLeft: '10px',
              justifyContent: 'center',
            }}
          />
        </Grid>
      </Grid>

      {loading && <CustomLoading />}
    </>
  )
}

export default UserEditForm
