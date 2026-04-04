/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Box, Card, CardContent, IconButton, MenuItem, SelectChangeEvent, useTheme } from '@mui/material'
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

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'

import { GetAllCompany } from '@api/admin/company/get-all-company-api'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import {
  CompanyDetailsResponse,
  GetAllCompanyResponseInterface,
} from '@interfaces/response/admin/get-all-company-response-interface'


interface Props {
  setCompanyData: (row: CompanyDetailsResponse | null) => void
  canEditPage: boolean
}

const CompanySearchForm: React.FC<Props> = ({ setCompanyData, canEditPage }) => {
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
  const [hasSearched, setHasSearched] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rows, setRows] = useState<CompanyDetailsResponse[]>([])

  const [filters, setFilters] = useState({
    name: '',
    nit: '',
    active: true as any,
  })

  const qCompany: GetAllCompanyOutputInterface = useMemo(
    () => ({
      id: '',
      name: filters.name || '',
      nit: filters.nit || '',
      active: filters.active || true,
      page: 0,
      size: 100,
    }),
    [filters]
  )

  const { fetchData: fetchCompanies } = useFetchData<GetAllCompanyOutputInterface, GetAllCompanyResponseInterface>(
    qCompany,
    (resp) => setRows(resp?.object?.list ?? []),
    'company',
    GetAllCompany as (p: GetAllCompanyOutputInterface) => Promise<GetAllCompanyResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  useEffect(() => {
    fetchCompanies()
  }, [])

  useEffect(() => {
    if (!hasSearched) return

    if (rows.length === 0) {
      showInfo(t('msg_no_results_companies'))
    } else {
      showSuccess(t('msg_results_found_companies', { count: rows.length }))
    }
  }, [rows, hasSearched])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: String(value) }))
  }

  const handleSelectChange = (e: SelectChangeEvent<unknown>) => {
    const { name, value } = e.target as { name: string; value: unknown }
    setFilters((prev) => ({ ...prev, [name]: String(value ?? '') }))
  }

  const handleSearch = () => {
    fetchCompanies()
    setHasSearched(true)
  }

  const handleEdit = (row: CompanyDetailsResponse) => setCompanyData(row)

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('lbl_name'), flex: 1.2 },
    { field: 'nit', headerName: t('lbl_nit'), flex: 0.8 },
    { field: 'address', headerName: t('lbl_address'), flex: 1 },
    { field: 'legalRepresentative', headerName: t('lbl_legalRepresentative'), flex: 1 },
    { field: 'phone', headerName: t('lbl_phone'), flex: 0.8 },
    { field: 'email', headerName: t('lbl_mail'), flex: 1 },
    {
      field: 'active',
      headerName: t('lbl_status'),
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => (params.value ? t('lbl_active') : t('lbl_inactive')),
    },
    ...(canEditPage
      ? [
          {
            field: 'edit',
            headerName: t('lbl_edit'),
            flex: 0.5,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
              <IconButton
                color="primary"
                onClick={() => handleEdit(params.row)}
                sx={{ color: buttonBgColor, '&:hover': { background: buttonBgColor, color: buttonTextColor } }}
              >
                <PencilIcon />
              </IconButton>
            ),
          },
        ]
      : []),
  ]

  if (error) {
    console.error('Error CompanySearchForm:', error)
  }

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
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomTextField
              label={t('lbl_name')}
              name="name"
              value={filters.name}
              onChange={handleInputChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomTextField
              label={t('lbl_nit')}
              name="nit"
              value={filters.nit}
              onChange={handleInputChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <CustomSelectFormControl
              label={t('lbl_status')}
              name="active"
              value={filters.active}
              onChange={handleSelectChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark
            >
              <MenuItem value="">{t('lbl_all')}</MenuItem>
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
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
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
                minHeight: { xs: 280, sm: 350, md: 420 },
                height: { xs: 280, sm: 350, md: 420 },
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
                  rows={rows}
                  columns={columns}
                  getRowId={(r) => r.id}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  loading={loading}
                  checkboxSelection={false}
                  onRowDoubleClick={(p) => handleEdit(p.row)}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default CompanySearchForm
