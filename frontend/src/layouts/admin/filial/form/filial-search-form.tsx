/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Box, Card, CardContent, IconButton, MenuItem, SelectChangeEvent, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { GridColDef } from '@mui/x-data-grid'
import { PencilIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import CustomDataGrid from '@components/atoms/custom-data-grid'
import CustomLoading2 from '@components/atoms/custom-loading2/custom-loading2'
import CustomSelectFormControl from '@components/atoms/custom-select-form-control'
import CustomTextField from '@components/atoms/custom-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { PAGE_SIZE_OPTIONS } from '@utils/constants'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'
import { useGridExportPanel } from '@hooks/use-grid-export-panel'

import { GetAllCompany } from '@api/admin/company/get-all-company-api'
import { GetAllFilialApi } from '@api/admin/filial/get-all-filial-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import {
  CompanyDetailsResponse,
  GetAllCompanyResponseInterface,
} from '@interfaces/response/admin/get-all-company-response-interface'
import {
  FilialsDetailsResponse,
  GetAllFilialResponseInterface,
} from '@interfaces/response/admin/get-all-filial-response-interface'


interface FilialSearchFormProps {
  setFilialData: (filial: FilialsDetailsResponse | null) => void
  canEditPage: boolean
}

const FilialSearchForm: React.FC<FilialSearchFormProps> = ({ setFilialData, canEditPage }) => {
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
  const [filialList, setFilialList] = useState<FilialsDetailsResponse[]>([])
  const [filters, setFilters] = useState({
    idCompany: '',
    name: '',
    nit: '',
    state: true,
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Filtros iniciales
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

  // Filtros para la búsqueda de filiales
  const dataInitFilial = useMemo(
    () => ({
      id: '',
      name: filters.name ?? '',
      nit: filters.nit ?? '',
      active: filters.active || true,
      idCompany: filters.idCompany ? filters.idCompany : '',
      page: 0,
      size: 100,
    }),
    [filters]
  )

  const { fetchData: fetchCompany } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    dataInitCompany,
    (response) => setCompanyOptions(response?.object?.list ?? []),
    'company',
    GetAllCompany as (params: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  const { fetchData: fetchFilials } = useFetchData<GetAllFilialOutputInterface, GetAllFilialResponseInterface>(
    dataInitFilial,
    (response) =>
      setFilialList(Array.isArray(response?.object?.list) ? (response.object.list as FilialsDetailsResponse[]) : []),
    'filial',
    GetAllFilialApi as (params: GetAllFilialOutputInterface) => Promise<GetAllFilialResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  useEffect(() => {
    fetchCompany()
  }, [])

  useEffect(() => {
    fetchFilials()
  }, [filters])

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<unknown>
  ) => {
    const { name, value } = e.target as { name?: string; value: unknown }
    setFilters((prev) => ({ ...prev, [name as string]: value as any }))
  }

  const handleSearch = () => {
    setHasSearched(true)
    fetchFilials()
  }

  const handleEditFilial = (filial: FilialsDetailsResponse) => setFilialData(filial)

  // Toast de resultados después de buscar
  useEffect(() => {
    if (!hasSearched) return

    if (filialList.length === 0) {
      showInfo(t('msg_no_results_filials'))
    } else {
      showSuccess(t('msg_results_found_filials', { count: filialList.length }))
    }
  }, [filialList, hasSearched, showInfo, showSuccess, t])

  // Estructura de columnas para DataGrid
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: t('lbl_name'), flex: 1 },
      { field: 'nit', headerName: t('lbl_nit'), flex: 1 },
      { field: 'address', headerName: t('lbl_address'), flex: 1 },
      { field: 'phone', headerName: t('lbl_phone'), flex: 1 },
      { field: 'email', headerName: t('lbl_mail'), flex: 1 },
      {
        field: 'active',
        headerName: t('lbl_active'),
        flex: 1,
        renderCell: (params) => (params.value ? t('lbl_active') : t('lbl_inactive')),
      },
      ...(canEditPage
        ? [
            {
              field: 'edit',
              headerName: t('lbl_edit'),
              flex: 0.5,
              renderCell: (params: { row: FilialsDetailsResponse }) => (
                <IconButton
                  sx={{
                    color: buttonBgColor,
                    '&:hover': { background: buttonBgColor, color: buttonTextColor },
                  }}
                  onClick={() => handleEditFilial(params.row)}
                >
                  <PencilIcon />
                </IconButton>
              ),
            },
          ]
        : []),
    ],
    [t, canEditPage, buttonBgColor, buttonTextColor, handleEditFilial]
  )

  if (error) {
    console.error('Error: ', error)
  }

  useGridExportPanel({
    columns,
    rows: filialList,
    fileName: t('lbl_filials'),
    excludeFields: ['edit'],
    valueFormatters: {
      active: (v: any) => (v ? t('lbl_active') : t('lbl_inactive')),
    },
  })

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
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomSelectFormControl
              label={t('lbl_company')}
              name="idCompany"
              value={filters.idCompany ?? ''}
              onChange={handleFilterChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark
            >
              <MenuItem value="">{t('lbl_select_option')}</MenuItem>
              {companyOptions?.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {item.name}
                </MenuItem>
              ))}
            </CustomSelectFormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomTextField
              label={t('lbl_name')}
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <CustomTextField
              label={t('lbl_nit')}
              name="nit"
              value={filters.nit}
              onChange={handleFilterChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <CustomSelectFormControl
              label={t('lbl_active')}
              name="active"
              value={filters.active}
              onChange={handleFilterChange}
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
          <Grid size={{ xs: 12, sm: 2 }} display="flex" alignItems="center">
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
                  rows={filialList}
                  columns={columns}
                  getRowId={(row) => row.id}
                  loading={loading}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  checkboxSelection={false}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default FilialSearchForm
