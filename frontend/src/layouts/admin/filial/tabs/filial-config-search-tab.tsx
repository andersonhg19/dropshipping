/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Card, CardContent, IconButton, MenuItem, SelectChangeEvent, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { GridColDef } from '@mui/x-data-grid'
import { PencilIcon, PlusIcon } from 'lucide-react'
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

import { GetAllFilialConfigApi } from '@api/admin/filial/get-all-filial-config-api'

import { GetAllFilialConfigOutputInterface } from '@interfaces/output/admin/get-all-filial-config-output-interface'
import { GetAllFilialConfigResponseInterface } from '@interfaces/response/admin/get-all-filial-config-response-interface'

import FilialConfigEditModal from '@layouts/admin/filial/tabs/modal/filial-config-edit-modal'

interface FilialConfigSearchFormProps {
  idSubsidiary: number
}

const FilialConfigSearchForm: React.FC<FilialConfigSearchFormProps> = ({ idSubsidiary }) => {
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
  const [configList, setConfigList] = useState<any[]>([])
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    active: '',
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<any | undefined>(undefined)
  const [hasSearched, setHasSearched] = useState(false)

  const handleReload = () => fetchFilialConfigs()

  // Filtros para la búsqueda de configuraciones
  const dataInitConfig = useMemo(
    () => ({
      id: '',
      idSubsidiary: idSubsidiary,
      idCompany: '',
      name: filters.name ?? '',
      value: '',
      type: filters.type ?? '',
      idUser: '',
      active: filters.active !== '' ? filters.active === 'true' : null,
      page: 0,
      size: 100,
    }),
    [idSubsidiary, filters]
  )

  // -- Para nuevo registro
  const handleNewConfig = () => {
    setEditConfig(undefined)
    setEditModalOpen(true)
  }

  // -- Para editar
  const handleEditConfig = useCallback((row: any) => {
    setEditConfig(row)
    setEditModalOpen(true)
  }, [])

  const { fetchData: fetchFilialConfigs } = useFetchData<
    GetAllFilialConfigOutputInterface,
    GetAllFilialConfigResponseInterface
  >(
    dataInitConfig,
    (response) => setConfigList(Array.isArray(response?.object?.list) ? response.object.list : []),
    'filial-config',
    GetAllFilialConfigApi as unknown as (
      params: GetAllFilialConfigOutputInterface
    ) => Promise<GetAllFilialConfigResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) {
        showError(err)
      }
    }
  )

  useEffect(() => {
    fetchFilialConfigs()
  }, [filters, idSubsidiary])

  useEffect(() => {
    if (!hasSearched) return
    if (loading) return

    if (configList.length === 0) {
      showInfo(t('msg_no_results_filialConfig'))
    } else {
      showSuccess(t('msg_results_found_filialConfig', { count: configList.length }))
    }
  }, [configList, hasSearched, loading, showInfo, showSuccess, t])

  const handleFilterChange = (e: SelectChangeEvent<unknown> | React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string }
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = () => {
    setHasSearched(true)
    fetchFilialConfigs()
  }

  // Estructura de columnas para DataGrid
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'type', headerName: t('lbl_type'), flex: 1 },
      { field: 'name', headerName: t('lbl_name'), flex: 1 },
      { field: 'value', headerName: t('lbl_value'), flex: 1 },
      {
        field: 'active',
        headerName: t('lbl_status'),
        flex: 1,
        renderCell: (params) => (params.value ? t('lbl_active') : t('lbl_inactive')),
      },
      {
        field: 'edit',
        headerName: t('lbl_edit'),
        flex: 0.5,
        renderCell: (params) => (
          <IconButton
            sx={{
              color: buttonBgColor,
              '&:hover': { background: buttonBgColor, color: buttonTextColor },
            }}
            onClick={() => handleEditConfig(params.row)}
          >
            <PencilIcon />
          </IconButton>
        ),
      },
    ],
    [t, buttonBgColor, buttonTextColor, handleEditConfig]
  )

  useGridExportPanel({
    columns,
    rows: configList,
    fileName: t('lbl_configs'),
    excludeFields: ['edit'],
    valueFormatters: {
      active: (v: any) => (v ? t('lbl_active') : t('lbl_inactive')),
    },
  })

  if (error) {
    // Lo seguimos dejando para DEBUG en consola, pero ya también sale en toast
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
              label={t('lbl_type')}
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              inputBgColor={inputBgColor}
              inputBorderColor={inputBorderColor}
              textColor={textColor}
              labelColor={textSecondaryColor}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
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
            >
              <MenuItem value="">{t('lbl_all')}</MenuItem>
              <MenuItem value="true">{t('lbl_active')}</MenuItem>
              <MenuItem value="false">{t('lbl_inactive')}</MenuItem>
            </CustomSelectFormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 1 }} display="flex" alignItems="center">
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
          <Grid
            size="auto"
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            sx={{
              ml: 'auto',
            }}
          >
            <IconButton
              color="primary"
              onClick={handleNewConfig}
              sx={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
                ml: 1,
                borderRadius: 30,
                boxShadow: 1,
                '&:hover': {
                  filter: 'brightness(0.9)',
                },
              }}
              aria-label={t('btn_add')}
            >
              <PlusIcon />
            </IconButton>
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
                  rows={configList}
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
      <FilialConfigEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        idCompany={configList[0]?.idCompany || ''}
        idSubsidiary={idSubsidiary}
        initialData={editConfig}
        onSuccess={handleReload}
      />
    </Card>
  )
}

export default FilialConfigSearchForm
