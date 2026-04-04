'use client'

// import { PencilIcon } from 'lucide-react'; // Descomenta si usas edición
import React, { useEffect, useMemo, useState } from 'react'

import { Box, Card, CardContent, MenuItem, SelectChangeEvent, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { GridColDef } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'

import CustomDataGrid from '@components/atoms/custom-data-grid'
import CustomLoading2 from '@components/atoms/custom-loading2/custom-loading2'
import CustomSelectFormControl from '@components/atoms/custom-select-form-control'
import CustomTextField from '@components/atoms/custom-text-field'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { PAGE_SIZE_OPTIONS } from '@utils/constants'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'

import { GetAllPagesApi } from '@api/admin/page/get-pages-all'

import { GetPagesAllOutputInterface } from '@interfaces/output/admin/get-all-page-output-interface'
import { GetAllPagesResponseInterface, PageDTO } from '@interfaces/response/admin/get-all-pages-response-interface'

interface PageSearchFormProps {
  setPageData: (page: PageDTO | null) => void
}

const PageSearchForm: React.FC<PageSearchFormProps> = () => {
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

  const [error, setError] = useState('')
  const [pageList, setPageList] = useState<PageDTO[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  const [filters, setFilters] = useState({
    name: '',
    npage: '',
    active: 'true',
  })

  const dataInitPage = useMemo(
    () => ({
      id: '',
      npage: filters.npage,
      icon: '',
      name: filters.name,
      idModifiedBy: '',
      idModule: '',
      active: filters.active === 'true' ? true : filters.active === 'false' ? false : null,
      size: 10,
      page: 0,
    }),
    [filters]
  )

  const { fetchData: fetchPages } = useFetchData<GetPagesAllOutputInterface, GetAllPagesResponseInterface>(
    dataInitPage,
    (response) => {
      const arr = response.object.list ?? []
      setPageList(arr)
    },
    'pages',
    GetAllPagesApi as (params: GetPagesAllOutputInterface) => Promise<GetAllPagesResponseInterface>,
    setLoading,
    (error) => setError(error ?? '')
  )

  const handleFilterChange = (event: React.ChangeEvent<{ name: string; value: any }> | SelectChangeEvent<unknown>) => {
    const target = event.target as { name: string; value: unknown }
    setFilters((prev) => ({ ...prev, [target.name]: String(target.value) }))
  }

  const handleSearch = () => {
    setError('')
    fetchPages()
  }

  // Para habilitar la edición:
  // const handleEditPage = (page: PageDTO) => setPageData(page);

  const columns: GridColDef[] = [
    { field: 'name', headerName: t('lbl_name'), flex: 1 },
    { field: 'moduleName', headerName: t('lbl_module'), flex: 1 },
    {
      field: 'active',
      headerName: t('lbl_status'),
      flex: 1,
      renderCell: (params) => (params.value ? t('lbl_active') : t('lbl_inactive')),
    },
  ]

  useEffect(() => {
    fetchPages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) {
    console.error('Error: ', error)
  }

  return (
    <Card
      elevation={1}
      sx={{
        background: cardBgColor,
        borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
        boxShadow: muiTheme.shadows[4],
        mb: { xs: 1.5, sm: 2 },
        border: `1px solid ${cardBorderColor}`,
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ pb: 0, p: { xs: 1, sm: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomTextField
              label={t('lbl_npage')}
              name="npage"
              value={filters.npage}
              onChange={handleFilterChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <CustomSelectFormControl
              label={t('lbl_status')}
              name="active"
              value={filters.active}
              onChange={handleFilterChange}
              labelColor={textSecondaryColor}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              borderDark={true}
              selectProps={{
                labelId: 'status-select',
              }}
            >
              <MenuItem value="true">{t('lbl_active')}</MenuItem>
              <MenuItem value="false">{t('lbl_inactive')}</MenuItem>
              <MenuItem value="null">{t('lbl_all')}</MenuItem>
            </CustomSelectFormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }} display="flex" alignItems="center">
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

        {/* Tabla */}
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
                  rows={pageList}
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  checkboxSelection
                  getRowId={(row) => row.id}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

export default PageSearchForm
