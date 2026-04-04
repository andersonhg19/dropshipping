'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Card, CardContent, IconButton, MenuItem, useTheme } from '@mui/material'
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
import { GetAllTypeUsersApi } from '@api/admin/user/get-all-type-users-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import { GetAllTypeUserOutputInterface } from '@interfaces/output/admin/get-all-type-user-output-interface'
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

interface UserTypeSearchFormProps {
  setTypeUser: (typeUser: TypeUserDTOInterface | null) => void
  canEditPage?: boolean
}

const UserTypeSearchForm: React.FC<UserTypeSearchFormProps> = ({ setTypeUser, canEditPage }) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const {
    cardBgColor,
    cardBorderColor,
    inputBgColor,
    inputBorderColor,
    textColor,
    textSecondaryColor,
    buttonBgColor,
    buttonTextColor,
  } = usePaletteVars()

  const { showError, showInfo, showSuccess } = useToast()

  const [error, setError] = useState('')

  const [companyOptions, setCompanyOptions] = useState<CompanyDetailsResponse[] | null>([])
  const [subsidiaryOptions, setSubsidiaryOptions] = useState<FilialsDetailsResponse[] | null>([])

  const { userCompanyValue, userSubsidiaryValue } = useMemo(() => {
    const user = getUser() as any
    const parseId = (value: unknown): string => {
      const parsed = Number(value)
      return Number.isNaN(parsed) || parsed <= 0 ? '' : String(parsed)
    }

    return {
      userCompanyValue: parseId(user?.idCompany ?? user?.companyId),
      userSubsidiaryValue: parseId(user?.idSubsidiary ?? user?.subsidiaryId),
    }
  }, [])

  const [companyFilter, setCompanyFilter] = useState(userCompanyValue)
  const [subsidiaryFilter, setSubsidiaryFilter] = useState(userSubsidiaryValue)

  const [typeUserList, setTypeUserList] = useState<TypeUserDTOInterface[]>([])
  const [typeUserFilters, setTypeUserFilters] = useState<{
    id: number | null
    name: string
    active: boolean | null
    size: number
    page: number
  }>({
    id: null,
    name: '',
    active: true,
    size: 10,
    page: 0,
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState(false)

  const dataInitCompany: GetAllCompanyOutputInterface = {
    id: '',
    size: 1000,
    page: 0,
    name: '',
    nit: '',
    state: true,
  }

  const dataInitSubsidiary: GetAllFilialOutputInterface = {
    id: null,
    name: '',
    nit: '',
    state: true,
    idCompany: companyFilter ? Number(companyFilter) : null,
    page: 0,
    size: 1000,
  }

  const dataInitTypeUser: GetAllTypeUserOutputInterface = {
    id: typeUserFilters.id,
    name: typeUserFilters.name,
    idCompany: companyFilter ? Number(companyFilter) : null,
    idSubsidiary: subsidiaryFilter ? Number(subsidiaryFilter) : null,
    active: typeof typeUserFilters.active === 'boolean' ? typeUserFilters.active : true,
    size: typeUserFilters.size,
    page: typeUserFilters.page,
  }

  const { fetchData: fetchTypeUsers } = useFetchData<GetAllTypeUserOutputInterface, GetAllTypeUserResponseInterface>(
    dataInitTypeUser,
    (response) => {
      setTypeUserList(response?.object?.list ?? [])
    },
    'type users',
    GetAllTypeUsersApi as (params: GetAllTypeUserOutputInterface) => Promise<GetAllTypeUserResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  const { fetchData: fetchCompany } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    dataInitCompany,
    (response) => {
      setCompanyOptions(response?.object?.list ?? [])
    },
    'company',
    GetAllCompany as (params: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (err) => {
      if (err) showError(err)
    }
  )

  const { fetchData: fetchSubsidiary } = useFetchData<GetAllFilialOutputInterface, GetAllFilialResponseInterface>(
    dataInitSubsidiary,
    (response) => {
      const list = response?.object?.list ?? []
      setSubsidiaryOptions(list)
      setSubsidiaryFilter((prev) => {
        if (prev) return prev

        const canUseUserDefault =
          userSubsidiaryValue &&
          companyFilter === userCompanyValue &&
          list.some((item) => String(item.id ?? '') === userSubsidiaryValue)

        if (canUseUserDefault) return userSubsidiaryValue

        return list[0]?.id ? String(list[0].id) : ''
      })
    },
    'subsidiary',
    GetAllFilialApi as unknown as (params: GetAllFilialOutputInterface) => Promise<GetAllFilialResponseInterface>,
    setLoading,
    (err) => {
      if (err) showError(err)
    }
  )

  const handleFilterChange = (e: { target: { name: string; value: any } }) => {
    const { name, value } = e.target

    if (name === 'companyFilter') {
      setCompanyFilter(String(value))
      setSubsidiaryFilter('')
      return
    }

    if (name === 'subsidiaryFilter') {
      setSubsidiaryFilter(String(value))
      return
    }

    if (name === 'name') {
      setTypeUserFilters((prev) => ({ ...prev, name: String(value) }))
      return
    }

    if (name === 'active') {
      const v = String(value)
      setTypeUserFilters((prev) => ({ ...prev, active: v === '' ? null : v === 'true' }))
      return
    }
  }

  const handleSearch = () => {
    setError('')
    setHasSearched(true)
    fetchTypeUsers()
  }

  const handleEditUser = useCallback(
    (user: TypeUserDTOInterface) => {
      setTypeUser(user)
    },
    [setTypeUser]
  )

  // Toast de resultados
  useEffect(() => {
    if (!hasSearched) return

    if (typeUserList.length === 0) {
      showInfo(t('msg_no_results_typeUsers'))
    } else {
      showSuccess(t('msg_results_found_typeUsers', { count: typeUserList.length }))
    }
  }, [typeUserList, hasSearched, showInfo, showSuccess, t])

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: t('lbl_name'), flex: 1 },
      { field: 'companyName', headerName: t('lbl_company'), flex: 1 },
      { field: 'subsidiaryName', headerName: t('lbl_subsidiary'), flex: 1 },
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
                <IconButton color="primary" onClick={() => handleEditUser(params.row)}>
                  <PencilIcon />
                </IconButton>
              ),
            },
          ]
        : []),
    ],
    [t, canEditPage, handleEditUser]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCompany()
  }, [])

  useEffect(() => {
    if (companyFilter) {
      fetchSubsidiary()
    } else {
      setSubsidiaryOptions([])
      setSubsidiaryFilter('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyFilter])

  useGridExportPanel({
    columns,
    rows: typeUserList,
    fileName: t('lbl_roles'),
    excludeFields: ['edit'],
    valueFormatters: {
      active: (v: any) => (v ? t('lbl_active') : t('lbl_inactive')),
    },
  })

  return (
    <Card
      sx={{
        background: cardBgColor,
        borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
        boxShadow: muiTheme.shadows[3],
        border: `1px solid ${cardBorderColor}`,
        mt: { xs: 1.5, sm: 2 },
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <CustomSelectFormControl
              label={t('lbl_company')}
              name="companyFilter"
              value={companyFilter}
              onChange={handleFilterChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark={true}
            >
              <MenuItem value="">{t('lbl_select_option')}</MenuItem>
              {companyOptions &&
                companyOptions.map((item, idx) => (
                  <MenuItem key={item.id ?? idx} value={item.id ?? ''}>
                    {item.name}
                  </MenuItem>
                ))}
            </CustomSelectFormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelectFormControl
              label={t('lbl_filial')}
              name="subsidiaryFilter"
              value={subsidiaryFilter}
              onChange={handleFilterChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark={true}
            >
              <MenuItem value="">{t('lbl_select_option')}</MenuItem>
              {subsidiaryOptions &&
                subsidiaryOptions.map((item, idx) => (
                  <MenuItem key={item.id ?? idx} value={item.id ?? ''}>
                    {item.name}
                  </MenuItem>
                ))}
            </CustomSelectFormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomTextField
              label={t('lbl_name')}
              name="name"
              value={typeUserFilters?.name || ''}
              onChange={handleFilterChange}
              error={Boolean(error)}
              helperText={error}
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
              value={typeUserFilters?.active === true ? 'true' : 'false'}
              onChange={handleFilterChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark={true}
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
            mt: { xs: 1.5, sm: 2 },
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
                  rows={typeUserList}
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

export default UserTypeSearchForm
