'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined'
import { Alert, Box, Button, Card, CardContent, Grid, MenuItem, TextField, Typography } from '@mui/material'
import { subsidiaryAtom } from '@states/subsidiary-atom'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'

import { formatDateInputForTimezone, getCurrentDateInTimezone } from '@utils/date-utils'
import { getUser, getUserCompanyContext } from '@utils/utilities'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllCompany } from '@api/admin/company/get-all-company-api'
import { GetAllFilialApi } from '@api/admin/filial/get-all-filial-api'

import type { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import type { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import type { DashboardFilterOutputInterface } from '@interfaces/output/dashboard/dashboard-filter-output-interface'
import type { CompanyDetailsResponse } from '@interfaces/response/admin/get-all-company-response-interface'
import type { FilialsDetailsResponse } from '@interfaces/response/admin/get-all-filial-response-interface'

import AccountsReceivableTab from '@layouts/dashboard/tabs/accounts-receivable-tab'
import DoctorInfoTab from '@layouts/dashboard/tabs/doctor-info-tab'
import GeneralInfoTab from '@layouts/dashboard/tabs/general-info-tab'
import ProviderInfoTab from '@layouts/dashboard/tabs/provider-info-tab'

export default function DashboardContent() {
  const { t } = useTranslation()
  const palette = usePaletteVars()
  const subsidiary = useAtomValue(subsidiaryAtom)

  const [tab, setTab] = useState(0)
  const { companyId: defaultCompanyId, subsidiaryId: defaultSubsidiaryId } = useMemo(() => getUserCompanyContext(), [])
  const currentUser = useMemo(() => getUser(), [])
  const userDoctorId = useMemo(() => currentUser?.idDoctor ?? null, [currentUser])
  const [companies, setCompanies] = useState<CompanyDetailsResponse[]>([])
  const [subsidiaries, setSubsidiaries] = useState<FilialsDetailsResponse[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingSubsidiaries, setLoadingSubsidiaries] = useState(false)
  const [filters, setFilters] = useState(() => ({
    companyId: defaultCompanyId,
    subsidiaryId: defaultSubsidiaryId,
    startDate: getDefaultDates().start,
    endDate: getDefaultDates().end,
  }))
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilterOutputInterface | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [autoApplied, setAutoApplied] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchCompanies = async () => {
      setLoadingCompanies(true)
      setFilterError(null)
      try {
        const payload: GetAllCompanyOutputInterface = {
          id: '',
          name: '',
          nit: '',
          state: true,
          page: 0,
          size: 200,
        }
        const response = await GetAllCompany(payload)
        if (!mounted) return
        if (response?.correct) {
          setCompanies(response.object?.list ?? [])
        } else {
          setFilterError(response?.message || 'No fue posible cargar las compañías.')
        }
      } catch {
        if (!mounted) return
        setFilterError('Ocurrió un error cargando las compañías.')
      } finally {
        if (mounted) setLoadingCompanies(false)
      }
    }
    fetchCompanies()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!filters.companyId) {
      setSubsidiaries([])
      setFilters((prev) => ({ ...prev, subsidiaryId: '' }))
      return
    }

    let mounted = true
    const fetchSubsidiaries = async () => {
      setLoadingSubsidiaries(true)
      setFilterError(null)
      try {
        const payload: GetAllFilialOutputInterface = {
          id: null,
          name: '',
          nit: '',
          state: true,
          idCompany: Number(filters.companyId),
          page: 0,
          size: 200,
        }
        const response = await GetAllFilialApi(payload)
        if (!mounted) return
        if (response?.correct) {
          setSubsidiaries(response.object?.list ?? [])
        } else {
          setFilterError(response?.message || 'No fue posible cargar las filiales.')
        }
      } catch {
        if (!mounted) return
        setFilterError('Ocurrió un error cargando las filiales.')
      } finally {
        if (mounted) setLoadingSubsidiaries(false)
      }
    }
    fetchSubsidiaries()
    return () => {
      mounted = false
    }
  }, [filters.companyId])

  useEffect(() => {
    if (!subsidiary) return
    setFilters((prev) => ({
      ...prev,
      companyId: prev.companyId || (subsidiary.idCompany ? String(subsidiary.idCompany) : ''),
      subsidiaryId: prev.subsidiaryId || (subsidiary.id ? String(subsidiary.id) : ''),
    }))
  }, [subsidiary])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApplyFilters = useCallback(() => {
    if (!filters.companyId || !filters.subsidiaryId || !filters.startDate || !filters.endDate) {
      setValidationMessage('Por favor completa todos los campos antes de consultar.')
      return
    }

    setValidationMessage(null)
    setDashboardFilter({
      companyId: Number(filters.companyId),
      subsidiaryId: Number(filters.subsidiaryId),
      startDate: toBackendDate(filters.startDate),
      endDate: toBackendDate(filters.endDate),
      idContractor: null,
      idDoctor: null,
      idUserDoctor: userDoctorId,
      idMedicalProcedure: null,
      idCostCenter: null,
    })
  }, [filters, userDoctorId])

  const handleClearFilters = () => {
    setFilters({
      companyId: subsidiary?.idCompany ? String(subsidiary.idCompany) : defaultCompanyId,
      subsidiaryId: subsidiary?.id ? String(subsidiary.id) : defaultSubsidiaryId,
      startDate: getDefaultDates().start,
      endDate: getDefaultDates().end,
    })
    setDashboardFilter(null)
    setValidationMessage(null)
    setFilterError(null)
    setAutoApplied(false)
  }

  useEffect(() => {
    if (autoApplied) return
    if (filters.companyId && filters.subsidiaryId) {
      setAutoApplied(true)
      handleApplyFilters()
    }
  }, [autoApplied, filters.companyId, filters.subsidiaryId, handleApplyFilters])

  const tabConfig = [
    {
      label: t('lbl_general_info'),
      icon: InfoOutlinedIcon,
    },
    {
      label: t('lbl_doctor_info'),
      icon: MedicalInformationOutlinedIcon,
    },
    {
      label: t('lbl_provider_info'),
      icon: BusinessOutlinedIcon,
    },
    {
      label: t('lbl_accounts_receivable'),
      icon: AttachMoneyOutlinedIcon,
    },
  ]

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Card sx={{ mb: { xs: 2, sm: 4 }, borderRadius: { xs: 2, sm: 4 }, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            {t('lbl_filters') || 'Filtros'}
          </Typography>
          {validationMessage && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {validationMessage}
            </Alert>
          )}
          {filterError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {filterError}
            </Alert>
          )}
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: 'flex-end' }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label={t('lbl_company')}
                name="companyId"
                value={filters.companyId}
                onChange={handleInputChange}
                fullWidth
                disabled={loadingCompanies}
              >
                <MenuItem value="">{t('lbl_select_option')}</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label={t('lbl_subsidiary')}
                name="subsidiaryId"
                value={filters.subsidiaryId}
                onChange={handleInputChange}
                fullWidth
                disabled={!filters.companyId || loadingSubsidiaries}
              >
                <MenuItem value="">{t('lbl_select_option')}</MenuItem>
                {subsidiaries.map((sub) => (
                  <MenuItem key={sub.id} value={String(sub.id)}>
                    {sub.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label={t('lbl_startDate')}
                type="datetime-local"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label={t('lbl_endDate')}
                type="datetime-local"
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  border: `2px solid ${palette.buttonBgColor} !important`,
                  color: palette.buttonBgColor,
                  fontWeight: 600,
                  px: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    border: `2px solid ${palette.buttonBgColor} !important`,
                    backgroundColor: `${palette.buttonBgColor}15`,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              >
                {t('lbl_clear') || 'Limpiar'}
              </Button>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                sx={{
                  backgroundColor: palette.buttonBgColor,
                  color: palette.buttonTextColor,
                  border: `1px solid ${palette.buttonBgColor} !important`,
                  fontWeight: 600,
                  px: 3,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: palette.buttonBgColor,
                    border: `1px solid ${palette.buttonBgColor} !important`,
                    filter: 'brightness(1.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                {t('lbl_apply') || 'Aplicar filtros'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TAB BUTTONS */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: '4px', sm: '8px' },
          mb: 2,
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 0 },
          justifyContent: { xs: 'flex-start', md: 'center' },
          flexWrap: { xs: 'wrap', lg: 'nowrap' },
          backgroundColor: palette.cardBgColor,
          borderRadius: '12px',
          minHeight: { xs: 'auto', md: 78 },
          position: 'relative',
          zIndex: 1,
          overflowX: { xs: 'auto', lg: 'visible' },
        }}
      >
        {tabConfig.map((tabItem, idx) => {
          const Icon = tabItem.icon
          const active = tab === idx
          return (
            <Box
              component="button"
              key={tabItem.label}
              type="button"
              onClick={() => setTab(idx)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: '4px', sm: '5px' },
                minWidth: { xs: 'calc(50% - 4px)', sm: 'auto', md: 150, lg: 180 },
                flex: { xs: '1 1 calc(50% - 4px)', sm: '0 0 auto' },
                padding: { xs: '10px 14px', sm: '12px 20px', md: '14px 26px' },
                borderRadius: '8px',
                border: `2px solid ${palette.buttonBgColor} !important`,
                backgroundColor: active ? `${palette.buttonBgColor} !important` : `${palette.cardBgColor} !important`,
                color: active ? `${palette.buttonTextColor} !important` : palette.textSecondaryColor,
                boxShadow: active ? '0 4px 18px -8px rgba(0,60,100,0.20)' : 'none',
                fontWeight: active ? 700 : 500,
                fontSize: { xs: '0.625rem', sm: '0.72rem', md: '0.82rem' },
                letterSpacing: { xs: 0.5, md: 1 },
                cursor: active ? 'default' : 'pointer',
                outline: active ? `2px solid ${palette.buttonBgColor}` : 'none',
                transition: 'all 0.18s cubic-bezier(.48,.9,.31,1.12), box-shadow 0.22s',
                textTransform: 'none',
                position: 'relative',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: active
                    ? `${palette.buttonBgColor} !important`
                    : `${palette.buttonBgColor}20 !important`,
                },
              }}
            >
              <Icon
                sx={{
                  fontSize: { xs: 16, sm: 20, md: 24 },
                  color: active ? `${palette.buttonTextColor} !important` : palette.iconColor,
                  transition: 'color 0.22s cubic-bezier(.48,.9,.31,1.12)',
                }}
              />
              <Box
                component="span"
                sx={{
                  maxWidth: { xs: 60, sm: 80, md: 100, lg: 120 },
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {tabItem.label}
              </Box>
            </Box>
          )
        })}
      </Box>

      {/* PANELS */}
      <Box>
        {tab === 0 && <GeneralInfoTab filter={dashboardFilter} />}
        {tab === 1 && <DoctorInfoTab filter={dashboardFilter} />}
        {tab === 2 && <ProviderInfoTab filter={dashboardFilter} />}
        {tab === 3 && <AccountsReceivableTab filter={dashboardFilter} />}
      </Box>
    </Box>
  )
}

const getDefaultDates = () => {
  const now = getCurrentDateInTimezone()
  // Período inicial por defecto: mes anterior completo
  // Fecha de inicio: primer día del mes anterior a las 00:00
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0)
  // Fecha de fin: primer día del mes actual a las 00:00 (cierre del mes anterior)
  const end = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0)
  return {
    start: formatDateInputForTimezone(start),
    end: formatDateInputForTimezone(end),
  }
}

const toBackendDate = (value: string) => {
  if (!value) return ''
  return value.length === 16 ? `${value}:00` : value
}
