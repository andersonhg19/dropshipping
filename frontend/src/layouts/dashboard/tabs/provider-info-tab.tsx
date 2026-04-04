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

import ConsultationsBySupplierChart from '@components/molecules/dashboard/charts/information-by-contractor/consultations-by-supplier-chart'
import RevenuePerSupplierChart from '@components/molecules/dashboard/charts/information-by-contractor/revenue-per-supplier-chart'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetBillingByPolicyApi } from '@api/health/dashboard/get-billing-by-policy-api'
import { GetContractorIncomeApi } from '@api/health/dashboard/get-contractor-income-api'

import type { DashboardFilterOutputInterface } from '@interfaces/output/dashboard/dashboard-filter-output-interface'
import type {
  BillingByPolicyDTO,
  ContractorIncomeDTO,
} from '@interfaces/response/dashboard/dashboard-response-interface'

interface Props {
  filter: DashboardFilterOutputInterface | null
}

const ProviderInfoTab: React.FC<Props> = ({ filter }) => {
  const [selectedChart, setSelectedChart] = useState(0)
  const [billingData, setBillingData] = useState<BillingByPolicyDTO | null>(null)
  const [incomeData, setIncomeData] = useState<ContractorIncomeDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedChartOpen, setExpandedChartOpen] = useState(false)
  const palette = usePaletteVars()
  const { t } = useTranslation()
  const expandLabel = t('lbl_expand_chart', { defaultValue: 'Ampliar gráfica' })
  const closeLabel = t('btn_close', { defaultValue: 'Cerrar' })

  useEffect(() => {
    if (!filter) {
      setBillingData(null)
      setIncomeData(null)
      return
    }

    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [billingResp, incomeResp] = await Promise.all([
          GetBillingByPolicyApi(filter),
          GetContractorIncomeApi(filter),
        ])

        if (!mounted) return

        if (billingResp?.correct) {
          setBillingData(billingResp.object)
        } else {
          setBillingData(null)
          setError(billingResp?.message || 'No fue posible cargar las consultas por proveedor.')
        }

        if (incomeResp?.correct) {
          setIncomeData(incomeResp.object)
        } else {
          setIncomeData(null)
          setError((prev) => prev ?? incomeResp?.message ?? 'No fue posible cargar los ingresos por proveedor.')
        }
      } catch {
        if (!mounted) return
        setBillingData(null)
        setIncomeData(null)
        setError('Ocurrió un error consultando la información de proveedores.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [filter])

  const charts = [
    {
      title: t('lbl_queries_by_provider') || 'Consultas por Proveedor',
      render: (mini?: boolean) => <ConsultationsBySupplierChart mini={mini} data={billingData} loading={loading} />,
    },
    {
      title: t('lbl_income_by_provider') || 'Ingresos por Proveedor',
      render: (mini?: boolean) => <RevenuePerSupplierChart mini={mini} data={incomeData} loading={loading} />,
    },
  ]

  return (
    <Box>
      {error && filter && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!filter && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Selecciona filtros para ver la información por proveedor.
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
            <CardActionArea onClick={() => setExpandedChartOpen(true)} aria-label={expandLabel} sx={{ height: '100%' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                >
                  {charts[selectedChart]?.title}
                </Typography>
                {loading && filter ? <Skeleton variant="rounded" height={340} /> : charts[selectedChart]?.render(false)}
              </CardContent>
            </CardActionArea>
          </Card>
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
              {t('lbl_select_option') || 'Seleccione una opción'}
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {charts.map((chart, idx) => (
                <Grid size={12} key={chart.title}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: idx === selectedChart ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      boxShadow: idx === selectedChart ? 5 : 'none',
                      transition: 'all 0.18s',
                      height: { xs: 180, sm: 210, md: 230 },
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
                      <Box sx={{ width: '100%', height: { xs: 120, sm: 180 }, pointerEvents: 'none' }}>
                        {loading && filter ? (
                          <Skeleton variant="rounded" height={220} sx={{ width: '100%' }} />
                        ) : (
                          chart.render(true)
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={expandedChartOpen} onClose={() => setExpandedChartOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
          <Typography variant="h6" component="span">
            {charts[selectedChart]?.title}
          </Typography>
          <IconButton aria-label={closeLabel} onClick={() => setExpandedChartOpen(false)}>
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

export default ProviderInfoTab
