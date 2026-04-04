'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  MenuItem,
  SelectChangeEvent,
  Typography,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { GridColDef } from '@mui/x-data-grid'
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PALETTE_DEFAULT_VALUES } from '@core/constants/palette-default-values'

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

import { GetAllFilialStyleApi } from '@api/admin/filial/get-all-filial-style-api'

import { GetAllFilialStyleOutputInterface } from '@interfaces/output/admin/get-all-filial-style-output-interface'
import { GetAllFilialStyleResponseInterface } from '@interfaces/response/admin/get-all-filial-style-response-interface'
import { FilialStyleDetail } from '@interfaces/response/admin/save-filial-style-response-interface'

import FilialStyleEditModal from '@layouts/admin/filial/tabs/modal/filial-style-edit-modal'
import FilialStyleTemplateModal from '@layouts/admin/filial/tabs/modal/filial-style-template-modal'

interface FilialStyleSearchFormProps {
  idSubsidiary: number
}

const FilialStyleSearchForm: React.FC<FilialStyleSearchFormProps> = ({ idSubsidiary }) => {
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
  const [styleList, setStyleList] = useState<any[]>([])
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    typeValue: '',
    active: '',
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editStyle, setEditStyle] = useState<Partial<FilialStyleDetail> | undefined>(undefined)
  const [hasSearched, setHasSearched] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [templateSectionOpen, setTemplateSectionOpen] = useState(true)

  // Filtros para la búsqueda de estilos
  const dataInitStyle = useMemo(
    () => ({
      id: '',
      idSubsidiary: idSubsidiary,
      idCompany: '',
      name: filters.name ?? '',
      value: '',
      type: filters.type ?? '',
      typeValue: filters.typeValue ?? '',
      idModifiedBy: '',
      active: filters.active !== '' ? filters.active === 'true' : null,
      page: 0,
      size: 100,
    }),
    [idSubsidiary, filters]
  )

  const { fetchData: fetchFilialStyles } = useFetchData<
    GetAllFilialStyleOutputInterface,
    GetAllFilialStyleResponseInterface
  >(
    dataInitStyle,
    (response) => setStyleList(Array.isArray(response?.object?.list) ? response.object.list : []),
    'filial-style',
    (params: GetAllFilialStyleOutputInterface) =>
      GetAllFilialStyleApi(params).then((res: any) => {
        if (
          typeof res === 'object' &&
          res !== null &&
          'correct' in res &&
          'message' in res &&
          'errorCode' in res &&
          'object' in res
        ) {
          return res as GetAllFilialStyleResponseInterface
        }
        // Si la respuesta es inesperada, devolvemos un objeto de error
        return {
          correct: false,
          message: typeof res === 'string' ? res : 'Unexpected response',
          errorCode: -1,
          object: {
            page: 0,
            size: 0,
            totalPage: 0,
            list: [],
          },
        } as GetAllFilialStyleResponseInterface
      }),
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) {
        showError(err)
      }
    }
  )

  const handleNewStyle = () => {
    setEditStyle(undefined)
    setEditModalOpen(true)
  }

  const handleEditStyle = useCallback((row: any) => {
    setEditStyle(row as Partial<FilialStyleDetail>)
    setEditModalOpen(true)
  }, [])

  // Cargar listado inicial + cuando cambien filtros/idSubsidiary
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchFilialStyles()
  }, [filters, idSubsidiary])

  // Toasts de resultados al buscar explícitamente
  useEffect(() => {
    if (!hasSearched) return
    if (loading) return

    if (styleList.length === 0) {
      showInfo(t('msg_no_results_filialStyle'))
    } else {
      showSuccess(t('msg_results_found_filialStyle', { count: styleList.length }))
    }
  }, [styleList, hasSearched, loading, showInfo, showSuccess, t])

  const handleFilterChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target as { name?: string; value: unknown }
    setFilters((prev) => ({ ...prev, [name as string]: String(value) }))
  }

  const handleSearch = () => {
    setHasSearched(true)
    fetchFilialStyles()
  }

  const existingStyleNames = useMemo(() => styleList.map((s) => String(s.name).trim()), [styleList])

  // Estructura de columnas para DataGrid
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: t('lbl_name'), flex: 1 },
      { field: 'value', headerName: t('lbl_value'), flex: 1 },
      { field: 'type', headerName: t('lbl_type'), flex: 1 },
      { field: 'typeValue', headerName: t('lbl_typeValue'), flex: 1 },
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
            onClick={() => handleEditStyle(params.row)}
          >
            <PencilIcon />
          </IconButton>
        ),
      },
    ],
    [t, buttonBgColor, buttonTextColor, handleEditStyle]
  )

  useGridExportPanel({
    columns,
    rows: styleList,
    fileName: t('lbl_styles'),
    excludeFields: ['edit'],
    valueFormatters: {
      active: (v: any) => (v ? t('lbl_active') : t('lbl_inactive')),
    },
  })

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
        <React.Fragment>
          <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <CustomTextField
                label={t('lbl_name')}
                name="name"
                value={filters.name}
                onChange={(e) => setFilters((prev) => ({ ...prev, name: e.target.value }))}
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
                onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
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
                onClick={handleNewStyle}
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

          {/* Sección Estilos predefinidos */}
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
            <Box
              component="div"
              role="button"
              tabIndex={0}
              onClick={() => setTemplateSectionOpen(!templateSectionOpen)}
              onKeyDown={(e) => e.key === 'Enter' && setTemplateSectionOpen((v) => !v)}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 1.5, sm: 2 },
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: textColor,
                textAlign: 'left',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {templateSectionOpen ? (
                  <ChevronDownIcon size={20} />
                ) : (
                  <ChevronRightIcon size={20} />
                )}
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('lbl_predefined_styles', 'Estilos predefinidos')}
                </Typography>
              </Box>
              <FancyButton
                variant="primary"
                label={t('lbl_add_from_template', 'Agregar desde plantilla')}
                onClick={(e) => {
                  e.stopPropagation()
                  setTemplateModalOpen(true)
                }}
                className="h-10 rounded-lg px-4 text-sm font-semibold"
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                }}
              />
            </Box>
            <Collapse in={templateSectionOpen}>
              <CardContent sx={{ pt: 0, pb: 2, px: { xs: 1.5, sm: 2 } }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {t('msg_filialStyle_template_desc', 'Tokens que puede configurar. Agregue los que necesite y edite el valor según su marca.')}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 1,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {PALETTE_DEFAULT_VALUES.map((token) => {
                    const exists = existingStyleNames.includes(token.name)
                    return (
                      <Box
                        key={token.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          p: 1,
                          borderRadius: 1,
                          border: `1px solid ${cardBorderColor}`,
                          backgroundColor: exists ? 'action.selected' : 'transparent',
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 0.5,
                            backgroundColor: token.value.startsWith('#') ? token.value : 'transparent',
                            border: token.value.startsWith('#') ? 'none' : `1px solid ${cardBorderColor}`,
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {token.name}
                          </Typography>
                          {exists && (
                            <Typography variant="caption" color="success.main" display="block">
                              ✓ {t('lbl_configured', 'Configurado')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </CardContent>
            </Collapse>
          </Card>

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
                    rows={styleList}
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
        </React.Fragment>
      </CardContent>
      <FilialStyleEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        idCompany={styleList[0]?.idCompany || ''}
        idSubsidiary={idSubsidiary}
        initialData={editStyle}
        onSuccess={() => {
          setEditModalOpen(false)
          fetchFilialStyles()
        }}
      />
      <FilialStyleTemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        idCompany={styleList[0]?.idCompany || ''}
        idSubsidiary={idSubsidiary}
        existingNames={existingStyleNames}
        onSuccess={() => {
          setTemplateModalOpen(false)
          fetchFilialStyles()
        }}
      />
    </Card>
  )
}

export default FilialStyleSearchForm
