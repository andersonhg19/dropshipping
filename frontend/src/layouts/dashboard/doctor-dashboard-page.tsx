'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Alert, Box, Button, Card, CardContent, Grid, Skeleton, TextField, Typography } from '@mui/material'
import { subsidiaryAtom } from '@states/subsidiary-atom'
import { useAtomValue } from 'jotai'
import { useTranslation } from 'react-i18next'

import DoctorCommissionChart from '@components/molecules/dashboard/charts/doctor-dashboard/doctor-commission-chart'
import DoctorConsultationsChart from '@components/molecules/dashboard/charts/doctor-dashboard/doctor-consultations-chart'
import DoctorProceduresBreakdownChart from '@components/molecules/dashboard/charts/doctor-dashboard/doctor-procedures-breakdown-chart'
import DoctorSummaryCards from '@components/molecules/dashboard/charts/doctor-dashboard/doctor-summary-cards'

import { formatDateInputForTimezone, getCurrentDateInTimezone } from '@utils/date-utils'
//import { usePaletteVars } from '@hooks/ui/use-palette-vars'
import { getUser, getUserCompanyContext } from '@utils/utilities'

import { GetDoctorProfitApi } from '@api/health/dashboard/get-doctor-profit-api'

import type { DashboardFilterOutputInterface } from '@interfaces/output/dashboard/dashboard-filter-output-interface'
import type { DoctorProfitDTO } from '@interfaces/response/dashboard/dashboard-response-interface'

export default function DoctorDashboardPage() {
  const { t } = useTranslation()
  //const palette = usePaletteVars()
  const subsidiary = useAtomValue(subsidiaryAtom)

  const { companyId: defaultCompanyId, subsidiaryId: defaultSubsidiaryId } = useMemo(() => getUserCompanyContext(), [])

  const [filters, setFilters] = useState(() => ({
    startDate: getDefaultDates().start,
    endDate: getDefaultDates().end,
  }))
  const [dashboardFilter, setDashboardFilter] = useState<DashboardFilterOutputInterface | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const [autoApplied, setAutoApplied] = useState(false)

  const [doctorProfit, setDoctorProfit] = useState<DoctorProfitDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener el doctor del usuario actual (si tiene asociado)
  const currentUser = useMemo(() => getUser(), [])
  const userDoctorId = useMemo(() => {
    // El idDoctor puede venir en diferentes propiedades del usuario
    console.log('CURRENT USER:', currentUser)
    return currentUser?.id ?? currentUser?.doctorId ?? null
  }, [currentUser])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApplyFilters = useCallback(() => {
    const companyId = subsidiary?.idCompany ?? Number(defaultCompanyId)
    const subsidiaryId = subsidiary?.id ?? Number(defaultSubsidiaryId)

    if (!companyId || !subsidiaryId || !filters.startDate || !filters.endDate) {
      setValidationMessage(t('msg_select_company_filial_date_range') || 'Por favor selecciona todos los campos.')
      return
    }

    setValidationMessage(null)
    setDashboardFilter({
      companyId: Number(companyId),
      subsidiaryId: Number(subsidiaryId),
      startDate: toBackendDate(filters.startDate),
      endDate: toBackendDate(filters.endDate),
      idDoctor: null,
      idUserDoctor: userDoctorId,
      idContractor: null,
      idMedicalProcedure: null,
      idCostCenter: null,
    })
  }, [filters, subsidiary, defaultCompanyId, defaultSubsidiaryId, userDoctorId, t])

  const handleClearFilters = () => {
    setFilters({
      startDate: getDefaultDates().start,
      endDate: getDefaultDates().end,
    })
    setDashboardFilter(null)
    setValidationMessage(null)
    setAutoApplied(false)
    setDoctorProfit(null)
    setError(null)
  }

  // Auto aplicar filtros cuando se carga la página
  useEffect(() => {
    if (autoApplied) return
    const companyId = subsidiary?.idCompany ?? Number(defaultCompanyId)
    const subsidiaryId = subsidiary?.id ?? Number(defaultSubsidiaryId)

    if (companyId && subsidiaryId) {
      setAutoApplied(true)
      handleApplyFilters()
    }
  }, [autoApplied, subsidiary, defaultCompanyId, defaultSubsidiaryId, handleApplyFilters])

  // Fetch data cuando cambia el filtro
  useEffect(() => {
    if (!dashboardFilter) {
      setDoctorProfit(null)
      return
    }

    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await GetDoctorProfitApi(dashboardFilter)
        if (!mounted) return
        if (response?.correct) {
          setDoctorProfit(response.object)
        } else {
          setDoctorProfit(null)
          setError(response?.message || t('msg_dashboard_no_data'))
        }
      } catch {
        if (!mounted) return
        setDoctorProfit(null)
        setError(t('lbl_error_unexpected'))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [dashboardFilter, t])

  // Obtener los datos del doctor actual
  const doctorData = useMemo(() => {
    if (!doctorProfit) return null

    // Si hay un idDoctor específico del usuario, buscar ese doctor
    if (userDoctorId && doctorProfit.profitByDoctor) {
      const found = doctorProfit.profitByDoctor.find((d) => d.idDoctor === userDoctorId)
      if (found) return found
    }

    // Si hay un solo doctor en doctorProfit, usarlo
    if (doctorProfit.doctorProfit) {
      return doctorProfit.doctorProfit
    }

    // Si hay múltiples doctores, tomar el primero (o el del usuario)
    if (doctorProfit.profitByDoctor && doctorProfit.profitByDoctor.length > 0) {
      return doctorProfit.profitByDoctor[0]
    }

    return null
  }, [doctorProfit, userDoctorId])

  const periodLabel = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return ''
    const format = new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const start = format.format(new Date(filters.startDate))
    const end = format.format(new Date(filters.endDate))
    return `${start} - ${end}`
  }, [filters])

  return (
    <Box sx={{ width: '100%', pb: { xs: 2, sm: 4 }, overflow: 'hidden' }}>
      {/* Filtros de fecha */}
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
          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: 'flex-end' }}>
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button variant="outlined" onClick={handleClearFilters} fullWidth>
                {t('lbl_clear') || 'Limpiar'}
              </Button>
              <Button variant="contained" onClick={handleApplyFilters} fullWidth>
                {t('lbl_apply') || 'Aplicar'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mensajes de error */}
      {error && dashboardFilter && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!dashboardFilter && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('msg_select_company_filial_date_range')}
        </Alert>
      )}

      {/* Summary Cards */}
      {loading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        doctorData && <DoctorSummaryCards doctorData={doctorData} periodLabel={periodLabel} />
      )}

      {/* Gráficas principales */}
      <Grid container spacing={3}>
        {/* Consultas por procedimiento */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: { xs: 2, sm: 4 }, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('lbl_my_consultations')}
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={350} />
              ) : doctorData ? (
                <DoctorConsultationsChart doctorData={doctorData} periodLabel={periodLabel} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('msg_dashboard_no_data')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Comisiones */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ borderRadius: { xs: 2, sm: 4 }, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('lbl_my_commissions')}
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={350} />
              ) : doctorData ? (
                <DoctorCommissionChart doctorData={doctorData} periodLabel={periodLabel} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('msg_dashboard_no_data')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Desglose de procedimientos */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: { xs: 2, sm: 4 }, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('lbl_procedures_breakdown')}
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={400} />
              ) : doctorData ? (
                <DoctorProceduresBreakdownChart doctorData={doctorData} periodLabel={periodLabel} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('msg_dashboard_no_data')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const getDefaultDates = () => {
  const now = getCurrentDateInTimezone()
  // Período inicial por defecto: mes anterior completo
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0)
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
