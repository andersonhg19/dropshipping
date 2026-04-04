'use client'

import React, { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetCompleteDashboardApi } from '@api/health/dashboard/get-complete-dashboard-api'

import type { DashboardFilterOutputInterface } from '@interfaces/output/dashboard/dashboard-filter-output-interface'
import type { DashboardResponseDTO } from '@interfaces/response/dashboard/dashboard-response-interface'

const TotalBillingPerPolicyChart = dynamic(
  () => import('@components/molecules/dashboard/charts/general-info/total-billing-per-policy-chart'),
  { ssr: false, loading: () => <Skeleton variant="rounded" height={160} /> }
)
const QuantityTypeQueryChart = dynamic(
  () => import('@components/molecules/dashboard/charts/general-info/quantity-Type-Query-Chart'),
  { ssr: false, loading: () => <Skeleton variant="rounded" height={160} /> }
)
const NumberOfAppointmentsPerSpecialistChart = dynamic(
  () => import('@components/molecules/dashboard/charts/general-info/number-of-appointments-per-specialist-chart'),
  { ssr: false, loading: () => <Skeleton variant="rounded" height={160} /> }
)
const ExpensesByCategoryChart = dynamic(
  () => import('@components/molecules/dashboard/charts/general-info/monthly-expenses-chart'),
  { ssr: false, loading: () => <Skeleton variant="rounded" height={160} /> }
)

// const AddGeneralInfoForm = dynamic(() => import('@components/molecules/dashboard/forms/add-general-info-form'), {
//   ssr: false,
// })

interface Props {
  filter: DashboardFilterOutputInterface | null
}

const GeneralInfoTab: React.FC<Props> = ({ filter }) => {
  const [selectedChart, setSelectedChart] = useState(0)
  const [dashboardData, setDashboardData] = useState<DashboardResponseDTO | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expandedChartOpen, setExpandedChartOpen] = useState(false)
  const palette = usePaletteVars()
  const { t } = useTranslation()
  const expandChartLabel = t('lbl_expand_chart', { defaultValue: 'Ampliar gráfica' })
  const closeLabel = t('btn_close', { defaultValue: 'Cerrar' })

  useEffect(() => {
    if (!filter) {
      setDashboardData(null)
      return
    }

    let mounted = true
    const fetchDashboardData = async () => {
      setLoadingData(true)
      setErrorMessage(null)
      try {
        const response = await GetCompleteDashboardApi(filter)
        if (!mounted) return
        if (response?.correct) {
          setDashboardData(response.object)
        } else {
          setDashboardData(null)
          setErrorMessage(response?.message || 'No fue posible obtener la información.')
        }
      } catch (error) {
        if (!mounted) return
        // eslint-disable-next-line no-console
        console.error('Error fetching dashboard metrics:', error)
        setDashboardData(null)
        setErrorMessage('Ocurrió un error consultando el dashboard.')
      } finally {
        if (mounted) setLoadingData(false)
      }
    }

    fetchDashboardData()
    return () => {
      mounted = false
    }
  }, [filter])

  const charts = [
    {
      id: 'billing-per-policy',
      title: t('lbl_total_billing_per_policy'),
      render: (mini?: boolean) => (
        <TotalBillingPerPolicyChart mini={mini} data={dashboardData?.billingByPolicy} loading={loadingData} />
      ),
    },
    {
      id: 'quantity-type-query',
      title: t('lbl_quantity_type_query'),
      render: (mini?: boolean) => (
        <QuantityTypeQueryChart mini={mini} data={dashboardData?.consultationTypeCount} loading={loadingData} />
      ),
    },
    {
      id: 'appointments-per-specialist',
      title: t('lbl_number_of_appointments_per_specialist'),
      render: (mini?: boolean) => (
        <NumberOfAppointmentsPerSpecialistChart mini={mini} data={dashboardData?.doctorProfit} loading={loadingData} />
      ),
    },
    {
      id: 'expenses-by-category',
      title: t('lbl_balance_by_cost_center'),
      render: (mini?: boolean) => (
        <ExpensesByCategoryChart mini={mini} data={dashboardData?.costCenterIncomeExpense} loading={loadingData} />
      ),
    },
  ]

  const handleOpenExpandedChart = () => {
    if (!charts[selectedChart]) return
    setExpandedChartOpen(true)
  }

  const handleCloseExpandedChart = () => setExpandedChartOpen(false)

  return (
    <Box>
      {errorMessage && filter && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {!filter && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('msg_select_company_filial_date_range')}
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            sx={{
              flex: 1,
              minHeight: { xs: 300, sm: 400, md: 450 },
              boxShadow: 5,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: { xs: 2, sm: 3 },
            }}
          >
            <Box
              onClick={(e) => {
                // Si el clic viene de un botón o elemento interactivo, no abrir el modal
                const target = e.target as HTMLElement

                // Verificar si el clic viene de elementos interactivos
                if (target.closest('button') || target.closest('input') || target.closest('select')) {
                  return
                }

                handleOpenExpandedChart()
              }}
              sx={{
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              aria-label={expandChartLabel}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOpenExpandedChart()
                }
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                >
                  {charts[selectedChart]?.title}
                </Typography>
                {charts[selectedChart]?.render(false)}
              </CardContent>
            </Box>
          </Card>
          {/* <Box mt={4}>
            <AddGeneralInfoForm />
          </Box> */}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper
            sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2 },
              background: palette.cardBgColor,
              boxShadow: 5,
              minHeight: { xs: 320, sm: 400, md: 450 },
              borderRadius: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 2, pb: 2, textAlign: 'center', fontWeight: 600, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
            >
              {t('lbl_select_option')}
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {charts.map((chart, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={chart.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: idx === selectedChart ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      boxShadow: idx === selectedChart ? 5 : 'none',
                      transition: 'all 0.18s',
                      height: { xs: 140, sm: 160 },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                    onClick={() => setSelectedChart(idx)}
                  >
                    <CardContent
                      sx={{
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: { xs: 12, sm: 15 } }}>
                        {chart.title}
                      </Typography>
                      <Box sx={{ width: '100%', height: 100, pointerEvents: 'none' }}>{chart.render(true)}</Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Dialog
        open={expandedChartOpen}
        onClose={handleCloseExpandedChart}
        maxWidth="lg"
        fullWidth
        aria-labelledby="chart-dialog-title"
      >
        <DialogTitle
          id="chart-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pr: 1,
          }}
        >
          <Typography variant="h6" component="span">
            {charts[selectedChart]?.title}
          </Typography>
          <IconButton aria-label={closeLabel} onClick={handleCloseExpandedChart}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: palette.cardBgColor, px: { xs: 1, sm: 3 } }}>
          <Box sx={{ minHeight: { xs: 280, sm: 420 }, py: { xs: 1, sm: 2 } }}>
            {charts[selectedChart]?.render(false)}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default GeneralInfoTab
