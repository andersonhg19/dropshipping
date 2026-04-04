/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, SelectChangeEvent, useTheme } from '@mui/material'
import { Card, CardContent, IconButton, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { PencilIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import CustomDataGrid from '@components/atoms/custom-data-grid'
import CustomLoading2 from '@components/atoms/custom-loading2/custom-loading2'
import CustomSelectFormControl from '@components/atoms/custom-select-form-control'
import CustomTextField from '@components/atoms/custom-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { PAGE_SIZE_OPTIONS } from '@utils/constants'
import { getUser } from '@utils/utilities'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'
import { useGridExportPanel } from '@hooks/use-grid-export-panel'

import { GetAllCompany } from '@api/admin/company/get-all-company-api'
import { GetAllFilialApi } from '@api/admin/filial/get-all-filial-api'
import { GetAllUsersApi } from '@api/admin/user/get-all-user-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import { GetUsersAllOutputInterface } from '@interfaces/output/admin/get-all-users-output-interface'
import {
  CompanyDetailsResponse,
  GetAllCompanyResponseInterface,
} from '@interfaces/response/admin/get-all-company-response-interface'
import {
  FilialsDetailsResponse,
  GetAllFilialResponseInterface,
} from '@interfaces/response/admin/get-all-filial-response-interface'
import {
  GetAllUsersResponseInterface,
  UserDTOInterface,
} from '@interfaces/response/admin/get-all-users-response-interface'

import { UserInitData } from '@layouts/admin/init-data'


function unwrap<T = any>(res: any): { correct?: boolean; message?: string; errorCode?: number; object?: T } {
  if (
    res &&
    typeof res === 'object' &&
    'object' in res &&
    res.object &&
    typeof res.object === 'object' &&
    'correct' in res.object
  ) {
    return res.object as any // envelope interno
  }
  return res as any
}

interface UserSearchFormProps {
  setUserData: (user: UserDTOInterface | null) => void
  canEditPage: boolean
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({ setUserData, canEditPage }) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const {
    cardBgColor,
    cardBorderColor,
    textColor,
    textSecondaryColor,
    inputBgColor,
    inputBorderColor,
    buttonBgColor,
    buttonTextColor,
  } = usePaletteVars()

  const { showError, showInfo, showSuccess } = useToast()

  const [error, setError] = useState('')
  const [companyOptions, setCompanyOptions] = useState<CompanyDetailsResponse[] | null>([])
  const [subsidiaryOptions, setSubsidiaryOptions] = useState<FilialsDetailsResponse[] | null>([])
  const [userList, setUserList] = useState<UserDTOInterface[]>([])
  const { userCompanyId, userSubsidiaryId } = useMemo(() => {
    const user = getUser() as any
    const parseId = (value: unknown): number | null => {
      const parsed = Number(value)
      return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
    }

    return {
      userCompanyId: parseId(user?.idCompany ?? user?.companyId),
      userSubsidiaryId: parseId(user?.idSubsidiary ?? user?.subsidiaryId),
    }
  }, [])

  const [filters, setFilters] = useState<{
    company: string
    subsidiary: number | null
    user: typeof UserInitData
  }>({
    company: userCompanyId ? String(userCompanyId) : '',
    subsidiary: userSubsidiaryId,
    user: {
      ...UserInitData,
      idCompany: userCompanyId ? String(userCompanyId) : null,
      idSubsidiary: userSubsidiaryId ?? null,
    },
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState(false)

  const dataInitCompany = useMemo(
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

  const dataInitSubsidiary = useMemo(
    () => ({
      id: null,
      name: '',
      nit: '',
      state: true,
      idCompany: filters.company ? Number(filters.company) : null,
      page: 0,
      size: 1000,
    }),
    [filters.company]
  )

  const dataInitUser = useMemo(
    () => ({
      id: filters.user?.id ?? '',
      idTypeUser:
        typeof filters.user?.idTypeUser === 'number'
          ? filters.user.idTypeUser
          : !filters.user?.idTypeUser || isNaN(Number(filters.user?.idTypeUser))
            ? null
            : Number(filters.user.idTypeUser),
      idSubsidiary: filters.subsidiary ? Number(filters.subsidiary) : null,
      idCompany: filters.company ?? null,
      name: filters.user?.name ?? '',
      lastName: filters.user?.lastName ?? '',
      email: filters.user?.email ?? '',
      dni: filters.user?.dni ?? '',
      active: filters.user?.active ?? true,
      size: filters.user?.size ?? 10,
      page: filters.user?.page ?? 0,
      idModifiedBy:
        typeof filters.user?.idModifiedBy === 'number'
          ? filters.user.idModifiedBy
          : !filters.user?.idModifiedBy || isNaN(Number(filters.user?.idModifiedBy))
            ? null
            : Number(filters.user.idModifiedBy),
      cellphone: filters.user?.cellphone ?? '',
    }),
    [filters.user, filters.company, filters.subsidiary]
  )

  const { fetchData: fetchUsers } = useFetchData<GetUsersAllOutputInterface, GetAllUsersResponseInterface>(
    dataInitUser,
    (response) => {
      const env = unwrap<GetAllUsersResponseInterface['object']>(response)
      setUserList(env?.object?.list ?? [])
    },
    'users',
    GetAllUsersApi as (params: GetUsersAllOutputInterface) => Promise<GetAllUsersResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  const { fetchData: fetchCompany } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    dataInitCompany,
    (response) => {
      const env = unwrap<GetAllCompanyResponseInterface['object']>(response)
      const companies = (env?.object as any)?.list ?? []
      setCompanyOptions(companies)
    },
    'company',
    GetAllCompany as (params: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  const { fetchData: fetchSubsidiary } = useFetchData<GetAllFilialOutputInterface, GetAllFilialResponseInterface>(
    dataInitSubsidiary,
    (response) => {
      const env = unwrap<GetAllFilialResponseInterface['object']>(response)
      const subs = (env?.object as any)?.list ?? []
      setSubsidiaryOptions(subs)
      setFilters((prev) => {
        if (prev.subsidiary !== null) return prev

        const preferredUserSubsidiary =
          userSubsidiaryId && subs.some((item: { id: any }) => Number(item.id) === userSubsidiaryId)
            ? userSubsidiaryId
            : null
        const fallbackSubsidiary = subs.length ? Number(subs[0].id) : null
        const nextSubsidiary = preferredUserSubsidiary ?? fallbackSubsidiary

        if (nextSubsidiary === prev.subsidiary) return prev

        return {
          ...prev,
          subsidiary: nextSubsidiary,
          user: {
            ...prev.user,
            idSubsidiary: nextSubsidiary,
          },
        }
      })
    },
    'subsidiary',
    GetAllFilialApi as unknown as (params: GetAllFilialOutputInterface) => Promise<GetAllFilialResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target as { name: string; value: unknown }

    setFilters((prev) => {
      const updated = { ...prev }

      if (name === 'company') {
        const companyValue = value === '' ? '' : String(value)
        updated.company = companyValue
        updated.subsidiary = null
        updated.user = {
          ...prev.user,
          idCompany: companyValue ? String(companyValue) : null,
          idSubsidiary: null,
        }
        return updated
      }

      if (name === 'subsidiary') {
        const subsidiaryValue = value === '' ? null : Number(value)
        updated.subsidiary = subsidiaryValue
        updated.user = {
          ...prev.user,
          idSubsidiary: subsidiaryValue,
        }
        return updated
      }

      if (name === 'active') {
        updated.user = { ...prev.user, active: String(value) === 'true' }
        return updated
      }

      return updated
    })
  }

  const handleFilterChange = (event: React.ChangeEvent<any>) => {
    const name = event.target.name
    const value = String(event.target.value)

    setFilters((prev) => {
      const updated = { ...prev }

      if (name === 'company') {
        updated.company = value === '' ? '' : String(value)
        updated.subsidiary = null
      } else if (name === 'subsidiary') {
        updated.subsidiary = value === '' ? null : Number(value)
      } else {
        if (name === 'active') {
          updated.user = {
            ...prev.user,
            active: value === 'true',
          }
        } else {
          updated.user = {
            ...prev.user,
            [name]: value || '',
          }
        }
      }
      return updated
    })
  }

  const handleSearch = () => {
    setError('')
    setHasSearched(true)
    fetchUsers()
  }

  const handleEditUser = useCallback(
    (user: UserDTOInterface) => {
      setUserData(user)
    },
    [setUserData]
  )

  // Toast de resultados después de buscar
  useEffect(() => {
    if (!hasSearched) return

    if (userList.length === 0) {
      showInfo(t('msg_no_results_users'))
    } else {
      showSuccess(t('msg_results_found_users', { count: userList.length }))
    }
  }, [userList, hasSearched])

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: t('lbl_name'), flex: 1 },
      { field: 'dni', headerName: t('lbl_documentNumber'), flex: 1 },
      { field: 'idCompany', headerName: t('lbl_company'), flex: 1 },
      { field: 'idSubsidiary', headerName: t('lbl_subsidiary'), flex: 1 },
      {
        field: 'active',
        headerName: t('lbl_status'),
        flex: 1,
        renderCell: (params) => (params.value ? t('lbl_active') : t('lbl_inactive')),
      },
      ...(canEditPage
        ? [
            {
              field: 'edit',
              headerName: t('lbl_edit'),
              flex: 1,
              renderCell: (params: GridRenderCellParams) => (
                <IconButton
                  sx={{
                    color: buttonBgColor,
                    '&:hover': { background: buttonBgColor, color: buttonTextColor },
                  }}
                  onClick={() => handleEditUser(params.row)}
                >
                  <PencilIcon />
                </IconButton>
              ),
            },
          ]
        : []),
    ],
    [t, buttonBgColor, buttonTextColor, handleEditUser, canEditPage]
  )

  useGridExportPanel({
    columns,
    rows: userList,
    fileName: t('lbl_users'),
    excludeFields: ['edit'],
    valueFormatters: {
      active: (v: any) => (v ? t('lbl_active') : t('lbl_inactive')),
    },
  })

  useEffect(() => {
    fetchCompany()
  }, [])

  useEffect(() => {
    if (filters.company) {
      fetchSubsidiary()
    } else {
      setSubsidiaryOptions([])
      setFilters((prev) => ({
        ...prev,
        subsidiary: null,
        user: { ...prev.user, idSubsidiary: null },
      }))
    }
  }, [filters.company])

  if (error) {
    console.error('Error: ', error)
  }

  return (
    <Card
      sx={{
        background: cardBgColor,
        borderRadius: muiTheme.shape.borderRadius,
        boxShadow: muiTheme.shadows[3],
        border: `1px solid ${cardBorderColor}`,
        p: { xs: 1, sm: 2 },
      }}
    >
      <CardContent>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomSelectFormControl
              label={t('lbl_company')}
              name="company"
              value={filters.company ?? ''}
              onChange={handleSelectChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark
            >
              <MenuItem value="">{t('lbl_select_option')} </MenuItem>
              {companyOptions?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </CustomSelectFormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomSelectFormControl
              label={t('lbl_filial')}
              name="subsidiary"
              value={filters.subsidiary == null ? '' : String(filters.subsidiary)}
              onChange={handleSelectChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark
              selectProps={{ disabled: !filters.company }}
            >
              <MenuItem value="">{t('lbl_select_option')}</MenuItem>
              {Array.isArray(subsidiaryOptions) &&
                subsidiaryOptions.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
            </CustomSelectFormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomTextField
              label={t('lbl_documentNumber')}
              name="dni"
              value={filters.user?.dni || ''}
              onChange={handleFilterChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
              inputProps={{
                onKeyDown: (e: any) => {
                  if (e.key === 'Enter') handleSearch()
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomTextField
              label={t('lbl_name')}
              name="name"
              value={filters.user?.name || ''}
              onChange={handleFilterChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomSelectFormControl
              label={t('lbl_status')}
              name="active"
              value={filters.user?.active === true ? 'true' : 'false'}
              onChange={handleSelectChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark
            >
              <MenuItem value="true">{t('lbl_active')}</MenuItem>
              <MenuItem value="false">{t('lbl_inactive')}</MenuItem>
            </CustomSelectFormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }} display="flex" alignItems="center">
            <FancyButton
              variant="primary"
              label={t('btn_find')}
              onClick={handleSearch}
              className="h-14 w-full rounded-lg px-6 py-3 text-lg font-semibold transition hover:shadow-lg"
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
            />
          </Grid>
        </Grid>

        <Card
          sx={{
            background: cardBgColor,
            borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
            boxShadow: muiTheme.shadows[2],
            border: `1px solid ${cardBorderColor}`,
            marginTop: { xs: 1.5, sm: 2 },
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
            <Box
              sx={{
                minHeight: { xs: 280, sm: 350, md: 400 },
                height: { xs: 280, sm: 350, md: 400 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}
            >
              {loading ? (
                <CustomLoading2 />
              ) : (
                <CustomDataGrid
                  rows={userList}
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  checkboxSelection
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default UserSearchForm
