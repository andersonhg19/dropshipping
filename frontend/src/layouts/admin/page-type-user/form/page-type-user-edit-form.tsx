/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useEffect, useMemo, useState } from 'react'

import { Box, Card, CardContent, Checkbox, Divider, MenuItem, Typography, useTheme } from '@mui/material'
import Grid from '@mui/material/Grid'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'

import CustomEditSelectFormControl from '@components/atoms/custom-edit-select-form-control'
import CustomLoading from '@components/atoms/custom-loading'
import FancyButton from '@components/atoms/fancy-button/fancy-button'

import { useToast } from '@hooks/context/toast-context'
import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { useFetchData } from '@hooks/use-fetch-data'
import { useSaveEdit } from '@hooks/use-save-edit'

// APIs módulos
import { GetAllModuleApi } from '@api/admin/module/get-all-module-api'
// APIs TODAS las páginas
import { GetAllPagesApi } from '@api/admin/page/get-pages-all'
// APIs permisos por tipo de usuario
import { GetPagesTypeUser } from '@api/admin/page/get-pages-type-user-all'
import { SavePageTypeUser } from '@api/admin/page/save-page-type-user'
import { GetAllTypeUsersApi } from '@api/admin/user/get-all-type-users-api'

import { GetAllModuleOutputInterface } from '@interfaces/output/admin/get-all-module-output-interface'
// DTOs de TODAS las páginas
import { GetPagesAllOutputInterface } from '@interfaces/output/admin/get-all-page-output-interface'
// DTOs de permisos por tipo usuario
import { GetPagesTypeUserAllOutputInterface } from '@interfaces/output/admin/get-all-page-type-user-output-interface'
import { GetAllTypeUserOutputInterface } from '@interfaces/output/admin/get-all-type-user-output-interface'
// DTOs save
import {
  PagePermission,
  SavePageTypeUserOutputInterface,
} from '@interfaces/output/admin/save-page-type-user-output-interface'
import {
  GetAllModuleResponseInterface,
  ModuleDetailInterface,
} from '@interfaces/response/admin/get-all-module-response-interface'
import { GetAllPagesResponseInterface, PageDTO } from '@interfaces/response/admin/get-all-pages-response-interface'
import {
  GetAllPagesTypeUserResponseInterface,
  PageTypeUserDTO,
} from '@interfaces/response/admin/get-all-pages-type-user-response-interface'
import {
  GetAllTypeUserResponseInterface,
  TypeUserDTOInterface,
} from '@interfaces/response/admin/get-all-type-user-response-interface'
import { SavePageTypeUserResponseInterface } from '@interfaces/response/admin/save-page-type-user-response-interface'

interface Props {
  typeUser: TypeUserDTOInterface
  onSaveAndExit: () => void
  onExit: () => void
}

type PermissionKey = 'canCreate' | 'canUpdate' | 'canRead' | 'canDelete' | 'active'

const PageTypeUserEditForm: React.FC<Props> = ({ typeUser, onSaveAndExit, onExit }) => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const {
    cardBgColor,
    cardBorderColor,
    textColor,
    buttonBgColor,
    buttonTextColor,
    dataGridHeaderBg,
    dataGridRowBg,
    dataGridRowHoverBg,
    dataGridSelectedBg,
    dataGridTextColor,
  } = usePaletteVars()
  const { showSuccess, showError } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [typeUserOptions, setTypeUserOptions] = useState<TypeUserDTOInterface[]>([])
  const [selectedTypeUserId, setSelectedTypeUserId] = useState<number | null>(typeUser.id ?? null)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(typeUser.idModifiedBy ?? 0)

  // ====== NUEVO: módulos
  type ModuleOption = { id: string; name: string }
  const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState<string>('') // '' => todos

  const [allPages, setAllPages] = useState<PageDTO[]>([])
  const [rawPermissions, setRawPermissions] = useState<PageTypeUserDTO[]>([])
  const [pageRows, setPageRows] = useState<PageTypeUserDTO[]>([])

  // ------- Fetch: LISTA DE MÓDULOS
  const moduleQuery = useMemo(
    () => ({
      id: '',
      name: '',
      idModifiedBy: '',
      active: true,
      size: 15,
      page: 0,
    }),
    []
  )

  const { fetchData: fetchModules } = useFetchData<GetAllModuleOutputInterface, GetAllModuleResponseInterface>(
    moduleQuery,
    (resp: GetAllModuleResponseInterface) => {
      const list = resp?.object?.list ?? []

      const mapped: ModuleOption[] = list.map((m: ModuleDetailInterface) => ({
        id: String(m.id ?? ''),
        name: String(m.name ?? ''),
      }))
      setModuleOptions(mapped)
      if (!selectedModuleId && mapped.length > 0 && mapped[0]) setSelectedModuleId(mapped[0].id)
    },
    'modules',
    GetAllModuleApi as (p: GetAllModuleOutputInterface) => Promise<GetAllModuleResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  // ------- Fetch TODAS las páginas (filtradas por módulo)
  const pagesAllQuery: GetPagesAllOutputInterface = useMemo(
    () => ({
      id: '',
      npage: '',
      icon: '',
      name: '',
      idModifiedBy: '',
      idModule: selectedModuleId || '',
      active: true,
      size: 50,
      page: 0,
    }),
    [selectedModuleId]
  )

  const { fetchData: fetchAllPages } = useFetchData<GetPagesAllOutputInterface, GetAllPagesResponseInterface>(
    pagesAllQuery,
    (resp) => {
      const list = resp?.object?.list ?? []
      const mapped: PageDTO[] = list.map((p: any) => ({
        id: p.id ?? null,
        npage: p.npage ?? '',
        icon: p.icon ?? '',
        name: p.name ?? '',
        idModule: String(p.idModule ?? ''),
        moduleName: p.moduleName ?? '',
        idModifiedBy: p.idModifiedBy ?? null,
        modifiedBy: p.modifiedBy ?? '',
        active: p.active ?? true,
      }))
      setAllPages(mapped)
    },
    'all-pages',
    GetAllPagesApi as (p: GetPagesAllOutputInterface) => Promise<GetAllPagesResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  // ------- Fetch permisos por tipo de usuario
  const queryPages: GetPagesTypeUserAllOutputInterface = useMemo(
    () => ({
      id: '',
      idPage: '',
      idTypeUser: String(selectedTypeUserId ?? ''),
      idCompany: 0,
      idSubsidiary: 0,
      idModifiedBy: '',
      canCreate: null,
      canUpdate: null,
      canRead: null,
      canDelete: null,
      active: null,
      size: 50,
      page: 0,
    }),
    [selectedTypeUserId]
  )

  const { fetchData: fetchPagesForTypeUser } = useFetchData<
    GetPagesTypeUserAllOutputInterface,
    GetAllPagesTypeUserResponseInterface
  >(
    queryPages,
    (resp) => setRawPermissions(resp.object.list ?? []),
    'pages-by-type-user',
    GetPagesTypeUser as (p: GetPagesTypeUserAllOutputInterface) => Promise<GetAllPagesTypeUserResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  // ------- lista de tipos de usuario (select, aunque está disabled)
  const queryTypeUsers: GetAllTypeUserOutputInterface = {
    id: null as unknown as number,
    name: '',
    idCompany: null as unknown as number,
    idSubsidiary: null as unknown as number,
    active: true,
    size: 50,
    page: 0,
  }
  const { fetchData: fetchTypeUsers } = useFetchData<GetAllTypeUserOutputInterface, GetAllTypeUserResponseInterface>(
    queryTypeUsers,
    (resp) => setTypeUserOptions(resp?.object?.list ?? []),
    'type-users',
    GetAllTypeUsersApi as (p: GetAllTypeUserOutputInterface) => Promise<GetAllTypeUserResponseInterface>,
    setLoading,
    (err) => {
      setError(err ?? '')
      if (err) showError(err)
    }
  )

  // ------- Guardar
  const permissions: PagePermission[] = useMemo(
    () =>
      pageRows.map((r) => ({
        idPage: r.idPage ?? 0,
        canCreate: !!r.canCreate,
        canUpdate: !!r.canUpdate,
        canRead: !!r.canRead,
        canDelete: !!r.canDelete,
        active: !!r.active,
      })),
    [pageRows]
  )

  const savePayload: SavePageTypeUserOutputInterface = {
    id: 0,
    idTypeUser: selectedTypeUserId ?? 0,
    idModifiedBy: selectedUserId ?? 0,
    pages: permissions,
  }

  const { handleSaveEdit } = useSaveEdit<SavePageTypeUserOutputInterface, SavePageTypeUserResponseInterface>(
    SavePageTypeUser as (p: SavePageTypeUserOutputInterface) => Promise<SavePageTypeUserResponseInterface>,
    () => {
      showSuccess(t('lbl_save_success'))
      onSaveAndExit()
    },
    'pageTypeUser',
    setLoading,
    (err) => {
      const msg = err ?? t('lbl_error_unexpected')
      setError(msg)
      showError(msg)
    },
    t,
    savePayload
  )

  // ------- Merge: allPages + rawPermissions
  useEffect(() => {
    if (!allPages.length || selectedTypeUserId == null) {
      setPageRows([])
      return
    }
    const permByPageId = new Map<number | string, PageTypeUserDTO>()
    for (const r of rawPermissions) {
      const key = (r.idPage as any) ?? (r.id as any)
      if (key != null) permByPageId.set(key, r)
    }

    const merged: PageTypeUserDTO[] = allPages.map((p) => {
      const key = p.id ?? ''
      const existing = permByPageId.get(key)
      if (existing) {
        return {
          ...existing,
          pageName: existing.pageName || p.name || '',
        }
      }
      return {
        id: 0,
        idPage: (typeof p.id === 'string' ? (Number.isNaN(Number(p.id)) ? 0 : Number(p.id)) : (p.id ?? 0)) as number,
        npage: p.npage ?? '',
        pageName: p.name ?? '',
        idTypeUser: selectedTypeUserId,
        typeUserName: typeUser?.name ?? '',
        idModifiedBy: selectedUserId ?? 0,
        modifiedBy: '',
        canCreate: false,
        canUpdate: false,
        canRead: false,
        canDelete: false,
        active: false,
      }
    })

    setPageRows(merged)
  }, [allPages, rawPermissions, selectedTypeUserId, selectedUserId, typeUser?.name])

  // ------- Toggle de permisos
  const toggle = (idPage: number | null, key: keyof PagePermission) => {
    setPageRows((prev) => prev.map((r) => ((r.idPage ?? -1) === (idPage ?? -2) ? { ...r, [key]: !r[key] } : r)))
  }

  const allChecked = (rows: PageTypeUserDTO[], key: PermissionKey) => rows.length > 0 && rows.every((r) => !!r[key])
  const someChecked = (rows: PageTypeUserDTO[], key: PermissionKey) => rows.some((r) => !!r[key])

  const toggleAll = (key: PermissionKey) => {
    setPageRows((prev) => {
      const nextValue = !allChecked(prev, key)
      return prev.map((r) => ({ ...r, [key]: nextValue }))
    })
  }

  const headerCheckboxState = (key: PermissionKey) => {
    const all = allChecked(pageRows, key)
    const some = someChecked(pageRows, key)
    return {
      checked: all,
      indeterminate: !all && some,
    }
  }

  const columns: GridColDef[] = [
    { field: 'pageName', headerName: t('lbl_pageName'), flex: 1, minWidth: 220 },
    {
      field: 'canCreate',
      headerName: t('lbl_create'),
      width: 130,
      renderHeader: () => {
        const { checked, indeterminate } = headerCheckboxState('canCreate')
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={() => toggleAll('canCreate')}
              sx={{ p: 0.5, color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
            />
            <Typography variant="body2">{t('lbl_create')}</Typography>
          </Box>
        )
      },
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={Boolean(params.value)}
          onChange={() => toggle(params.row.idPage, 'canCreate')}
          sx={{ color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
        />
      ),
    },
    {
      field: 'canRead',
      headerName: t('lbl_read'),
      width: 130,
      renderHeader: () => {
        const { checked, indeterminate } = headerCheckboxState('canRead')
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={() => toggleAll('canRead')}
              sx={{ p: 0.5, color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
            />
            <Typography variant="body2">{t('lbl_read')}</Typography>
          </Box>
        )
      },
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={Boolean(params.value)}
          onChange={() => toggle(params.row.idPage, 'canRead')}
          sx={{ color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
        />
      ),
    },
    {
      field: 'canUpdate',
      headerName: t('lbl_update'),
      width: 130,
      renderHeader: () => {
        const { checked, indeterminate } = headerCheckboxState('canUpdate')
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={() => toggleAll('canUpdate')}
              sx={{ p: 0.5, color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
            />
            <Typography variant="body2">{t('lbl_update')}</Typography>
          </Box>
        )
      },
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={Boolean(params.value)}
          onChange={() => toggle(params.row.idPage, 'canUpdate')}
          sx={{ color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
        />
      ),
    },
    {
      field: 'canDelete',
      headerName: t('lbl_delete'),
      width: 130,
      renderHeader: () => {
        const { checked, indeterminate } = headerCheckboxState('canDelete')
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={() => toggleAll('canDelete')}
              sx={{ p: 0.5, color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
            />
            <Typography variant="body2">{t('lbl_delete')}</Typography>
          </Box>
        )
      },
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={Boolean(params.value)}
          onChange={() => toggle(params.row.idPage, 'canDelete')}
          sx={{ color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
        />
      ),
    },
    {
      field: 'active',
      headerName: t('lbl_status'),
      width: 130,
      renderHeader: () => {
        const { checked, indeterminate } = headerCheckboxState('active')
        return (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              onChange={() => toggleAll('active')}
              sx={{ p: 0.5, color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
            />
            <Typography variant="body2">{t('lbl_status')}</Typography>
          </Box>
        )
      },
      renderCell: (params: GridRenderCellParams) => (
        <Checkbox
          checked={Boolean(params.value)}
          onChange={() => toggle(params.row.idPage, 'active')}
          sx={{ color: buttonBgColor, '&.Mui-checked': { color: buttonBgColor } }}
        />
      ),
    },
  ]

  useEffect(() => {
    setSelectedTypeUserId(typeUser.id ?? null)
    setSelectedUserId(typeUser.idModifiedBy ?? 0)
  }, [typeUser])

  useEffect(() => {
    fetchTypeUsers()
    fetchModules()
    fetchAllPages()
  }, [])

  useEffect(() => {
    if (selectedTypeUserId != null) {
      fetchPagesForTypeUser()
    } else {
      setRawPermissions([])
    }
  }, [selectedTypeUserId])

  useEffect(() => {
    fetchAllPages()
  }, [selectedModuleId])

  if (error) {
    console.error('Error PageTypeUserEditForm:', error)
  }

  return (
    <Card
      sx={{
        background: cardBgColor,
        borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
        boxShadow: muiTheme.shadows[3],
        border: `1px solid ${cardBorderColor}`,
        p: { xs: 1, sm: 2 },
        overflow: 'hidden',
      }}
    >
      <CardContent>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" color={textColor}>
              {t('lbl_typeUser')}: {typeUser.name}
              {typeUser.companyName ? ` — ${typeUser.companyName}` : ''}
              {typeUser.subsidiaryName ? ` / ${typeUser.subsidiaryName}` : ''}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <CustomEditSelectFormControl
              label={t('lbl_typeUser')}
              name="idTypeUser"
              value={selectedTypeUserId ?? ''}
              onChange={(e) =>
                setSelectedTypeUserId(Number((e.target as any).target?.value ?? (e.target as any).value))
              }
              disabled
            >
              {typeUserOptions.map((u) => (
                <MenuItem key={u.id ?? undefined} value={u.id ?? ''}>
                  {u.name}
                </MenuItem>
              ))}
            </CustomEditSelectFormControl>
          </Grid>

          {/* SELECT DE MÓDULOS */}
          <Grid size={{ xs: 12, md: 4 }}>
            <CustomEditSelectFormControl
              label={t('lbl_module')}
              name="idModule"
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(String((e.target as any).value ?? ''))}
            >
              <MenuItem value="">{t('lbl_all')}</MenuItem>
              {moduleOptions.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </CustomEditSelectFormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                minHeight: { xs: 280, sm: 350, md: 420 },
                height: { xs: 280, sm: 350, md: 420 },
                width: '100%',
                overflow: 'auto',
              }}
            >
              <DataGrid
                rows={pageRows.map((r) => ({ ...r, id: r.idPage ?? r.id }))}
                columns={columns}
                pageSizeOptions={[10]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                sx={{
                  bgcolor: cardBgColor,
                  color: dataGridTextColor,
                  borderRadius: muiTheme.shape.borderRadius,
                  '& .MuiDataGrid-columnHeaders': {
                    bgcolor: dataGridHeaderBg,
                    color: textColor,
                    fontWeight: 600,
                    fontSize: muiTheme.typography.body1.fontSize,
                  },
                  '& .MuiDataGrid-row': { bgcolor: dataGridRowBg },
                  '& .MuiDataGrid-row:hover': { bgcolor: dataGridRowHoverBg },
                  '& .MuiDataGrid-row.Mui-selected': { bgcolor: dataGridSelectedBg },
                  '& .MuiDataGrid-cell': { borderBottom: `1px solid ${cardBorderColor}` },
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container justifyContent="center" spacing={{ xs: 1.5, sm: 2 }}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FancyButton
              label={t('btn_save')}
              variant="primary"
              onClick={handleSaveEdit}
              className="w-full"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <FancyButton
              label={t('btn_exit')}
              variant="primary"
              onClick={onExit}
              className="w-full"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            />
          </Grid>
        </Grid>

        {loading && <CustomLoading />}
      </CardContent>
    </Card>
  )
}

export default PageTypeUserEditForm
