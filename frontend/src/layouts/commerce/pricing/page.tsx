'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { Box, Button, InputAdornment, Skeleton, Snackbar, TextField, Typography } from '@mui/material'
import { Calculator, Save } from 'lucide-react'
import { motion } from 'framer-motion'

import Breadcrumbs from '@components/atoms/breadcrumbs'
import { GetAllPricingConfig } from '@api/commerce/pricing-config/get-all-pricing-config-api'
import { SavePricingConfigApi } from '@api/commerce/pricing-config/save-pricing-config-api'

const defaultForm = {
  shippingCostDefault: '8.00', customsRate: '7.5', ivaRate: '19.0',
  ivaThresholdUsd: '50', gatewayFeePercent: '3.5', packagingCost: '0',
  exchangeRate: '4200', defaultMargin: '40',
}

export default function PricingLayoutForm() {
  const [form, setForm] = useState(defaultForm)
  const [configId, setConfigId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await GetAllPricingConfig({ page: 0, size: 1 })
      if (res?.correct && res.object?.list?.length > 0) {
        const c = res.object.list[0]
        setConfigId(c.id)
        setForm({
          shippingCostDefault: c.shippingCostDefault?.toString() || '8.00',
          customsRate: c.customsRate?.toString() || '7.5',
          ivaRate: c.ivaRate?.toString() || '19.0',
          ivaThresholdUsd: c.ivaThresholdUsd?.toString() || '50',
          gatewayFeePercent: c.gatewayFeePercent?.toString() || '3.5',
          packagingCost: c.packagingCost?.toString() || '0',
          exchangeRate: c.exchangeRate?.toString() || '4200',
          defaultMargin: c.defaultMargin?.toString() || '40',
        })
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    setSaving(true)
    try {
      await SavePricingConfigApi({
        ...(configId ? { id: configId } : {}),
        idCompany: 1, idSubsidiary: 1, idModifiedBy: 1,
        shippingCostDefault: parseFloat(form.shippingCostDefault) || 0,
        customsRate: parseFloat(form.customsRate) || 0,
        ivaRate: parseFloat(form.ivaRate) || 0,
        ivaThresholdUsd: parseFloat(form.ivaThresholdUsd) || 0,
        gatewayFeePercent: parseFloat(form.gatewayFeePercent) || 0,
        packagingCost: parseFloat(form.packagingCost) || 0,
        exchangeRate: parseFloat(form.exchangeRate) || 0,
        defaultMargin: parseFloat(form.defaultMargin) || 0,
        active: true,
      })
      setSnack('Configuracion guardada')
      fetchData()
    } catch { setSnack('Error al guardar') }
    setSaving(false)
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [field]: e.target.value }))

  // Simulacion de costo real
  const baseCost = 15
  const shipping = parseFloat(form.shippingCostDefault) || 0
  const customs = baseCost * (parseFloat(form.customsRate) || 0) / 100
  const subtotal = baseCost + shipping + customs
  const iva = subtotal > (parseFloat(form.ivaThresholdUsd) || 50) ? subtotal * (parseFloat(form.ivaRate) || 0) / 100 : 0
  const gateway = (subtotal + iva) * (parseFloat(form.gatewayFeePercent) || 0) / 100
  const packaging = parseFloat(form.packagingCost) || 0
  const totalCost = subtotal + iva + gateway + packaging
  const margin = parseFloat(form.defaultMargin) || 0
  const sellingPrice = totalCost / (1 - margin / 100)
  const rate = parseFloat(form.exchangeRate) || 4200

  const fields = [
    { key: 'shippingCostDefault', label: 'Envio promedio', suffix: 'USD', desc: 'Costo de envio internacional promedio' },
    { key: 'customsRate', label: 'Arancel aduanero', suffix: '%', desc: 'Textiles Colombia: ~7.5%' },
    { key: 'ivaRate', label: 'IVA', suffix: '%', desc: 'Impuesto al valor agregado' },
    { key: 'ivaThresholdUsd', label: 'Umbral IVA', suffix: 'USD', desc: 'IVA aplica a compras mayores a este monto' },
    { key: 'gatewayFeePercent', label: 'Comision pasarela', suffix: '%', desc: 'Comision del procesador de pago' },
    { key: 'packagingCost', label: 'Empaque', suffix: 'USD', desc: 'Costo de empaque por unidad' },
    { key: 'exchangeRate', label: 'Tasa de cambio', suffix: 'COP/USD', desc: 'Pesos colombianos por dolar' },
    { key: 'defaultMargin', label: 'Margen deseado', suffix: '%', desc: 'Porcentaje de ganancia objetivo' },
  ]

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto' }}>
      <Breadcrumbs />
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Configuracion de Precios
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5 }}>
          Define los costos reales para calcular precios de venta en Colombia
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Form */}
          <Box sx={{ flex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {fields.map(f => (
                  <Box key={f.key}>
                    <TextField
                      label={f.label} value={(form as any)[f.key]} onChange={set(f.key)}
                      fullWidth size="small" type="number"
                      InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{f.suffix}</Typography></InputAdornment> }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', mt: 0.3, ml: 1 }}>{f.desc}</Typography>
                  </Box>
                ))}
                <Button onClick={handleSave} disabled={saving}
                  sx={{ bgcolor: '#0071e3', color: '#fff', borderRadius: 99, textTransform: 'none', fontWeight: 600, py: 1.5, mt: 1,
                    '&:hover': { bgcolor: '#0077ED' } }}
                  startIcon={<Save size={18} />}>
                  {saving ? 'Guardando...' : 'Guardar Configuracion'}
                </Button>
              </Box>
            </motion.div>
          </Box>

          {/* Simulator */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Box sx={{ width: { xs: '100%', md: 320 }, p: 3, borderRadius: 4, bgcolor: '#f5f5f7',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)', position: { md: 'sticky' }, top: 24 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Calculator size={20} color="#0071e3" />
                <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Simulador</Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 2 }}>Producto ejemplo: $15.00 USD</Typography>
              {[
                { l: 'Precio proveedor', v: `$${baseCost.toFixed(2)}` },
                { l: 'Envio', v: `+$${shipping.toFixed(2)}` },
                { l: `Arancel (${form.customsRate}%)`, v: `+$${customs.toFixed(2)}` },
                { l: `IVA (${iva > 0 ? form.ivaRate + '%' : 'no aplica'})`, v: iva > 0 ? `+$${iva.toFixed(2)}` : '$0.00' },
                { l: `Pasarela (${form.gatewayFeePercent}%)`, v: `+$${gateway.toFixed(2)}` },
                { l: 'Empaque', v: `+$${packaging.toFixed(2)}` },
              ].map(r => (
                <Box key={r.l} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{r.l}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{r.v}</Typography>
                </Box>
              ))}
              <Box sx={{ borderTop: '1px solid #ddd', mt: 1.5, pt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Costo total</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>${totalCost.toFixed(2)} USD</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Precio venta ({margin}%)</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>${sellingPrice.toFixed(2)} USD</Typography>
              </Box>
              <Box sx={{ bgcolor: '#0071e310', borderRadius: 2, p: 1.5, mt: 2 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0071e3', textAlign: 'center' }}>
                  ${Math.round(sellingPrice * rate).toLocaleString()} COP
                </Typography>
                <Typography sx={{ fontSize: 11, color: 'text.secondary', textAlign: 'center', mt: 0.3 }}>
                  Ganancia: ${(sellingPrice - totalCost).toFixed(2)} USD ({Math.round((sellingPrice - totalCost) * rate).toLocaleString()} COP)
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  )
}
