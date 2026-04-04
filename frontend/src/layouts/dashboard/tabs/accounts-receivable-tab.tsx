'use client'

import React, { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import {
  Alert,
  Box,
  Card,
  CardActionArea,
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
import { useTranslation } from 'react-i18next'

import MonthlyAccountsReceivableChart from '@components/molecules/dashboard/charts/accounts-receivable/accounts-receivable-monthly-chart'
import DebtBySupplierChart from '@components/molecules/dashboard/charts/accounts-receivable/debt-by-supplier-chart'
import PaymentStatusByProviderChart from '@components/molecules/dashboard/charts/accounts-receivable/payment-status-by-provider-chart'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetContractorInvoiceDashboardApi } from '@api/health/dashboard/get-contractor-invoice-dashboard-api'

import type { DashboardFilterOutputInterface } from '@interfaces/output/dashboard/dashboard-filter-output-interface'
import type { ContractorInvoiceDashboardData } from '@interfaces/response/dashboard/contractor-invoice-dashboard-response-interface'

interface Props {
  filter: DashboardFilterOutputInterface | null
}

export default function AccountsReceivableTab({ filter }: Props) {
  const [selectedChart, setSelectedChart] = useState(0)
  const [expandedChartOpen, setExpandedChartOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState<ContractorInvoiceDashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const palette = usePaletteVars()
  const { t } = useTranslation()
  const expandLabel = t('lbl_expand_chart', { defaultValue: 'Ampliar gráfica' })
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
        const response = await GetContractorInvoiceDashboardApi({
          companyId: filter.companyId,
          subsidiaryId: filter.subsidiaryId,
          startDate: filter.startDate,
          endDate: filter.endDate,
          idContractor: filter.idContractor ?? null,
        })
        if (!mounted) return
        if (response?.correct) {
          setDashboardData(response.object)
        } else {
          setDashboardData(null)
          setErrorMessage(response?.message || 'No fue posible obtener la información.')
        }
      } catch (error) {
        if (!mounted) return
        console.error('Error fetching contractor invoice dashboard:', error)
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

  const CHARTS = [
    {
      title: t('lbl_debt_by_provider') || 'Deuda por Proveedor',
      render: (mini?: boolean) => <DebtBySupplierChart mini={mini} data={dashboardData} loading={loadingData} />,
    },
    {
      title: t('lbl_monthly_accounts_receivable') || 'Evolución Mensual de Cuentas por Cobrar',
      render: (mini?: boolean) => (
        <MonthlyAccountsReceivableChart
          mini={mini}
          data={dashboardData}
          loading={loadingData}
          periodRange={filter ? { startDate: filter.startDate, endDate: filter.endDate } : undefined}
        />
      ),
    },
    {
      title: t('lbl_payment_status_by_provider') || 'Estado de Pago por Proveedor',
      render: (mini?: boolean) => (
        <PaymentStatusByProviderChart mini={mini} data={dashboardData} loading={loadingData} />
      ),
    },
  ]

  if (!filter) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        {t('lbl_apply_filters_to_view_data') || 'Por favor aplica los filtros para ver los datos del dashboard.'}
      </Alert>
    )
  }

  if (errorMessage) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {errorMessage}
      </Alert>
    )
  }

  return (
    <Box>
      {loadingData && (
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="rectangular" height={450} sx={{ borderRadius: 2 }} />
        </Box>
      )}
      {!loadingData && (
        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: 'stretch' }}>
          {/* Visor grande izquierda */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Card
              sx={{
                flex: 1,
                minHeight: { xs: 300, sm: 400, md: 450 },
                boxShadow: 5,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: { xs: 2, sm: 3 },
                bgcolor: palette.cardBgColor,
                border: `1px solid ${palette.cardBorderColor}`,
              }}
            >
              <CardActionArea
                onClick={() => setExpandedChartOpen(true)}
                aria-label={expandLabel}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: palette.textColor }}>
                    {CHARTS[selectedChart]?.title}
                  </Typography>
                  {CHARTS[selectedChart]?.render(false)}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Selector derecha (mini charts) */}
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
                sx={{
                  mb: 2,
                  pb: 2,
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: { xs: '0.95rem', sm: '1.25rem' },
                  color: palette.textColor,
                }}
              >
                {t('lbl_select_option') || 'Seleccione una opción'}
              </Typography>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                {CHARTS.map((chart, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={chart.title}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        bgcolor: palette.cardBgColor,
                        border:
                          idx === selectedChart
                            ? `2px solid ${palette.buttonBgColor}`
                            : `1px solid ${palette.cardBorderColor}`,
                        boxShadow: idx === selectedChart ? 5 : 'none',
                        transition: 'all 0.18s',
                        height: { xs: 180, sm: 200, md: 230 },
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
                        <Typography
                          variant="subtitle2"
                          sx={{
                            mb: 1,
                            fontWeight: 600,
                            fontSize: { xs: 12, sm: 15 },
                            color: palette.textColor,
                          }}
                        >
                          {chart.title}
                        </Typography>
                        <Box sx={{ width: '100%', height: { xs: 120, sm: 150 }, pointerEvents: 'none' }}>
                          {chart.render(true)}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
      <Dialog open={expandedChartOpen} onClose={() => setExpandedChartOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <Typography variant="h6" component="span">
            {CHARTS[selectedChart]?.title}
          </Typography>
          <IconButton aria-label={closeLabel} onClick={() => setExpandedChartOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: palette.cardBgColor, px: { xs: 1, sm: 3 } }}>
          <Box sx={{ minHeight: { xs: 280, sm: 420 }, py: { xs: 1, sm: 2 } }}>
            {CHARTS[selectedChart]?.render(false)}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
