'use client'

import React, { useCallback, useEffect, useState } from 'react'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

import { usePaletteVars } from '@hooks/ui/use-palette-vars'

import { GetAllPricingConfig } from '@api/commerce/pricing-config/get-all-pricing-config-api'
import { SavePricingConfigApi } from '@api/commerce/pricing-config/save-pricing-config-api'

interface PricingForm {
  id: string
  shippingCostDefault: number
  customsRate: number
  ivaRate: number
  profitMargin: number
  platformFeeRate: number
  roundToNearest: number
  active: boolean
}

const emptyForm: PricingForm = {
  id: '',
  shippingCostDefault: 0,
  customsRate: 0,
  ivaRate: 19,
  profitMargin: 30,
  platformFeeRate: 5,
  roundToNearest: 990,
  active: true,
}

const PricingLayoutForm = () => {
  const { t } = useTranslation()
  const muiTheme = useTheme()
  const { cardBgColor, cardBorderColor } = usePaletteVars()

  const [form, setForm] = useState<PricingForm>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllPricingConfig({ page: 0, size: 1 })
      if (res.correct && res.object && res.object.list.length > 0) {
        setForm(res.object.list[0])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = async () => {
    setSaved(false)
    const res = await SavePricingConfigApi(form)
    if (res.correct) {
      setSaved(true)
      if (res.object?.id) {
        setForm((prev) => ({ ...prev, id: res.object.id }))
      }
    }
  }

  const handleChange = (field: keyof PricingForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: Number(e.target.value) })
    setSaved(false)
  }

  return (
    <Card
      elevation={1}
      sx={{
        background: cardBgColor,
        boxShadow: muiTheme.shadows[2],
        borderRadius: { xs: 2, sm: muiTheme.shape.borderRadius },
        mb: { xs: 2, sm: 3 },
        border: `1px solid ${cardBorderColor}`,
        overflow: 'hidden',
      }}
    >
      <CardHeader
        sx={{ '& .MuiCardHeader-title': { fontSize: { xs: '1rem', sm: '1.25rem' } } }}
        title={t('lbl_pricing_config')}
      />
      <CardContent>
        {loading ? (
          <Typography>{t('lbl_loading')}...</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
            <TextField
              label={t('lbl_shipping_cost_default')}
              type="number"
              value={form.shippingCostDefault}
              onChange={handleChange('shippingCostDefault')}
              fullWidth
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
            <TextField
              label={t('lbl_customs_rate') + ' (%)'}
              type="number"
              value={form.customsRate}
              onChange={handleChange('customsRate')}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
            />
            <TextField
              label={t('lbl_iva_rate') + ' (%)'}
              type="number"
              value={form.ivaRate}
              onChange={handleChange('ivaRate')}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
            />
            <TextField
              label={t('lbl_profit_margin') + ' (%)'}
              type="number"
              value={form.profitMargin}
              onChange={handleChange('profitMargin')}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
            />
            <TextField
              label={t('lbl_platform_fee_rate') + ' (%)'}
              type="number"
              value={form.platformFeeRate}
              onChange={handleChange('platformFeeRate')}
              fullWidth
              InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
            />
            <TextField
              label={t('lbl_round_to_nearest')}
              type="number"
              value={form.roundToNearest}
              onChange={handleChange('roundToNearest')}
              fullWidth
              helperText={t('lbl_round_helper')}
              InputProps={{ inputProps: { min: 0, step: 1 } }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
              <Button variant="contained" onClick={handleSave}>{t('lbl_save')}</Button>
              {saved && (
                <Typography color="success.main" variant="body2">
                  {t('lbl_saved_successfully')}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default PricingLayoutForm
