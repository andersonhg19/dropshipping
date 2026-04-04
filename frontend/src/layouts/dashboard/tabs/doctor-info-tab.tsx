'use client'

import React, { useEffect, useState } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'
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

import DoctorAttentionChart from '@components/molecules/dashboard/charts/doctors-info/doctor-attention-chart'
import DoctorIncomeBreakdownChart from '@components/molecules/dashboard/charts/doctors-info/doctor-income-breakdown-chart'
import RevenuePerDoctorChart from '@components/molecules/dashboard/charts/doctors-info/income-per-doctor-chart'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetDoctorIncomeBreakdownApi } from '@api/health/dashboard/get-doctor-income-breakdown-api'
import { GetDoctorProfitApi } from '@api/health/dashboard/get-doctor-profit-api'

import type { DashboardFilterOutputInterface } from '@interfaces/output/dashboard/dashboard-filter-output-interface'
import type { DoctorProfitDTO } from '@interfaces/response/dashboard/dashboard-response-interface'
import type { DoctorIncomeBreakdownItem } from '@interfaces/response/health/doctor-income-breakdown-response-interface'

interface Props {
  filter: DashboardFilterOutputInterface | null
}

const DoctorInfoTab: React.FC<Props> = ({ filter }) => {
  const { t } = useTranslation()
  const [selectedChart, setSelectedChart] = useState(0)
  const [doctorProfit, setDoctorProfit] = useState<DoctorProfitDTO | null>(null)
  const [incomeBreakdown, setIncomeBreakdown] = useState<DoctorIncomeBreakdownItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedChartOpen, setExpandedChartOpen] = useState(false)
  const palette = usePaletteVars()
  const expandLabel = t('lbl_expand_chart')
  const closeLabel = t('btn_close')

  useEffect(() => {
    if (!filter) {
      setDoctorProfit(null)
      setIncomeBreakdown(null)
      return
    }

    let mounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [profitResponse, breakdownResponse] = await Promise.all([
          GetDoctorProfitApi(filter),
          GetDoctorIncomeBreakdownApi(filter),
        ])
        if (!mounted) return
        if (profitResponse?.correct) {
          setDoctorProfit(profitResponse.object)
        } else {
          setDoctorProfit(null)
          setError(profitResponse?.message || t('msg_doctor_info_error'))
        }
        if (breakdownResponse?.correct && Array.isArray(breakdownResponse.object)) {
          setIncomeBreakdown(breakdownResponse.object)
        } else {
          setIncomeBreakdown(null)
        }
      } catch (err) {
        if (!mounted) return
        setDoctorProfit(null)
        setIncomeBreakdown(null)
        setError(t('msg_doctor_info_fetch_error'))
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
      title: 'Atenciones por Médico',
      render: (mini?: boolean) => (
        <DoctorAttentionChart
          mini={mini}
          data={doctorProfit}
          loading={loading}
          periodRange={
            filter
              ? {
                  startDate: filter.startDate,
                  endDate: filter.endDate,
                }
              : undefined
          }
        />
      ),
    },
    {
      title: 'Ingresos por Médico',
      render: (mini?: boolean) => (
        <RevenuePerDoctorChart
          mini={mini}
          data={doctorProfit}
          loading={loading}
          periodRange={
            filter
              ? {
                  startDate: filter.startDate,
                  endDate: filter.endDate,
                }
              : undefined
          }
        />
      ),
    },
    {
      title: 'Desglose Ingresos por Tipo',
      render: (mini?: boolean) => (
        <DoctorIncomeBreakdownChart
          mini={mini}
          data={incomeBreakdown}
          loading={loading}
          periodRange={
            filter
              ? {
                  startDate: filter.startDate,
                  endDate: filter.endDate,
                }
              : undefined
          }
        />
      ),
    },
  ]

  return (
    <Box>
      {error && filter && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {!filter && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Selecciona filtros para ver Información por Médico.
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
              role="button"
              tabIndex={0}
              aria-label={expandLabel}
              onClick={() => setExpandedChartOpen(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setExpandedChartOpen(true)
                }
              }}
              sx={{ height: '100%', outline: 'none', cursor: 'pointer' }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.95rem', sm: '1.25rem' } }}
                >
                  {charts[selectedChart]?.title}
                </Typography>
                {loading && filter ? <Skeleton variant="rounded" height={320} /> : charts[selectedChart]?.render(false)}
              </CardContent>
            </Box>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper
            sx={{
              flex: 1,
              p: { xs: 1.5, sm: 2 },
              boxShadow: 5,
              background: palette.cardBgColor,
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
              Seleccione una opción
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {charts.map((chart, idx) => (
                <Grid size={{ xs: 12, md: 12 }} key={chart.title}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: idx === selectedChart ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      boxShadow: idx === selectedChart ? 5 : 'none',
                      transition: 'all 0.18s',
                      height: { xs: 180, sm: 220, md: 240 },
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
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, fontSize: 15 }}>
                        {chart.title}
                      </Typography>
                      <Box sx={{ width: '100%', height: { xs: 80, sm: 100 }, pointerEvents: 'none' }}>
                        {loading && filter ? (
                          <Skeleton variant="rounded" height={100} sx={{ width: '100%' }} />
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

export default DoctorInfoTab
