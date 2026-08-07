'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  LinearProgress, Skeleton, TextField, Typography,
} from '@mui/material'
import { AlertTriangle, CheckCircle, MessageCircle, Package, Truck, XCircle } from 'lucide-react'

import Breadcrumbs from '@components/atoms/breadcrumbs'
import { getKeyApi } from '@utils/utilities'

/* ---------------------------------------------------------------------------
 * Bandeja de pedidos.
 *
 * Es la pantalla de la operacion diaria, y por eso NO es un CRUD: lo primero
 * que se ve es la cola de confirmacion, porque cada pedido que lleva horas sin
 * confirmar es un pedido con probabilidad creciente de perderse.
 *
 * El dato que manda el diseno de esta pantalla: entre el 20% y el 25% de los
 * pedidos contra entrega se caen si no se confirman antes de despachar.
 * ------------------------------------------------------------------------ */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
const API = `${BASE_URL}/COMMERCE-SERVICE/vn-api/v2/order`
const ID_COMPANY = Number(process.env.NEXT_PUBLIC_ID_COMPANY ?? 1)

interface OrderItem {
  productName: string
  quantity: number
  unitPrice: number
}

interface Order {
  id: number
  externalOrderId?: string
  status: string
  source?: string
  customerName?: string
  customerPhone?: string
  shippingAddress?: string
  shippingCity?: string
  total?: number
  currency?: string
  paymentMethod?: string
  utmCampaign?: string
  creation?: string
  items?: OrderItem[]
}

interface Metrics {
  total: number
  delivered: number
  lost: number
  open: number
  deliveryRatePercent: number
  cpaReported?: number
  cpaReal?: number
}

interface ApiResult<T = any> {
  correct: boolean
  message?: string
  object?: T | null
}

async function post<T = any>(path: string, body: Record<string, unknown>): Promise<ApiResult<T>> {
  const token = await getKeyApi()
  const resp = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, lng: 'es' },
    body: JSON.stringify(body),
  })
  const data = (await resp.json()) as unknown
  if (data && typeof data === 'object' && 'correct' in data) return data as ApiResult<T>
  return { correct: false, message: `Respuesta inesperada (HTTP ${resp.status}).` }
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  NUEVA:             { label: 'Sin confirmar', color: '#8A5A00', bg: '#FFF6E5' },
  CONFIRMADA:        { label: 'Confirmada',    color: '#0B5FBF', bg: '#E8F1FD' },
  ENVIADA_PROVEEDOR: { label: 'Con proveedor', color: '#6B4E9C', bg: '#F1EBFA' },
  EN_TRANSITO:       { label: 'En transito',   color: '#0B5FBF', bg: '#E8F1FD' },
  ENTREGADA:         { label: 'Entregada',     color: '#1B7F4F', bg: '#E8F5EE' },
  CANCELADA:         { label: 'Cancelada',     color: '#B3261E', bg: '#FDECEA' },
  DEVUELTA:          { label: 'Devuelta',      color: '#B3261E', bg: '#FDECEA' },
}
const DEFAULT_STYLE = { label: 'Desconocido', color: '#6E6E73', bg: '#F0F0F2' }

const money = (n?: number) =>
  n == null ? '—' : '$' + Math.round(n).toLocaleString('es-CO')

/** Horas transcurridas desde la creacion. Mide la urgencia de confirmar. */
function hoursSince(iso?: string): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return Math.floor((Date.now() - t) / 3600000)
}

/** Mensaje de WhatsApp listo para enviar, igual que el del plugin de la tienda. */
function whatsappUrl(order: Order): string {
  const phone = (order.customerPhone ?? '').replace(/\D/g, '')
  const full = phone.length === 10 ? `57${phone}` : phone
  const items = (order.items ?? []).map((i) => `- ${i.quantity} x ${i.productName}`).join('\n')
  const text = [
    `Hola ${(order.customerName ?? '').split(' ')[0]}! Te escribimos de VISNEX.`,
    '',
    `Recibimos tu pedido #${order.externalOrderId ?? order.id}:`,
    items,
    '',
    `Direccion: ${order.shippingAddress ?? ''}, ${order.shippingCity ?? ''}`,
    `Total a pagar al recibir: ${money(order.total)}`,
    '',
    'Confirmas que la direccion esta correcta y que lo recibes?',
    'Respondenos SI y lo despachamos hoy mismo.',
  ].join('\n')
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`
}

export default function OrdersLayout() {
  const [pending, setPending] = useState<Order[]>([])
  const [all, setAll] = useState<Order[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, a, m] = await Promise.all([
        post<Order[]>('/pending-confirmation', { idCompany: ID_COMPANY }),
        post<{ list: Order[] }>('/all', { idCompany: ID_COMPANY, page: 0, size: 50 }),
        post<Metrics>('/metrics', { idCompany: ID_COMPANY }),
      ])
      if (p.correct) setPending(p.object ?? [])
      if (a.correct) setAll(a.object?.list ?? [])
      if (m.correct) setMetrics(m.object ?? null)
      if (!p.correct && !a.correct) setError(p.message || a.message || 'No se pudieron cargar los pedidos.')
    } catch (e) {
      setError('Error de conexion: ' + (e as Error).message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function confirm(order: Order) {
    setBusyId(order.id)
    const res = await post('/confirm', { id: order.id, idModifiedBy: 1 })
    if (!res.correct) setError(res.message || 'No se pudo confirmar.')
    setBusyId(null)
    load()
  }

  async function doCancel() {
    if (!cancelTarget) return
    setBusyId(cancelTarget.id)
    const res = await post('/cancel', { id: cancelTarget.id, reason: cancelReason, idModifiedBy: 1 })
    if (!res.correct) setError(res.message || 'No se pudo cancelar.')
    setBusyId(null)
    setCancelTarget(null)
    setCancelReason('')
    load()
  }

  /* El pedido mas viejo sin confirmar: es el que mas riesgo tiene. */
  const oldestPendingHours = useMemo(() => {
    const hours = pending.map((o) => hoursSince(o.creation)).filter((h): h is number => h != null)
    return hours.length ? Math.max(...hours) : null
  }, [pending])

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: 'auto' }}>
      <Breadcrumbs />

      <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Pedidos
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 14, mt: 0.5, mb: 4 }}>
        Confirma antes de despachar. Es lo que evita perder el pedido y el flete.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>
      )}

      {/* ===================== METRICAS ===================== */}
      {metrics && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {[
            { label: 'Sin confirmar', value: pending.length, color: pending.length > 0 ? '#8A5A00' : 'inherit' },
            { label: 'Tasa de entrega', value: `${metrics.deliveryRatePercent ?? 0}%`, color: (metrics.deliveryRatePercent ?? 0) >= 75 ? '#1B7F4F' : '#8A5A00' },
            { label: 'Entregados (30d)', value: metrics.delivered, color: '#1B7F4F' },
            { label: 'Perdidos (30d)', value: metrics.lost, color: metrics.lost > 0 ? '#B3261E' : 'inherit' },
          ].map((m) => (
            <Box key={m.label} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: 26, fontWeight: 700, color: m.color }}>{m.value}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{m.label}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* La explicacion del CPA real: es el numero que nadie muestra y el que
          decide si la operacion gana o pierde plata. */}
      {metrics && metrics.deliveryRatePercent != null && metrics.deliveryRatePercent > 0 && metrics.deliveryRatePercent < 100 && (
        <Alert severity="info" icon={<AlertTriangle size={18} />} sx={{ mb: 4, borderRadius: 2 }}>
          Con una tasa de entrega del <strong>{metrics.deliveryRatePercent}%</strong>, tu costo real
          por venta es <strong>{Math.round(100 / metrics.deliveryRatePercent * 100) / 100}x</strong> el
          que reporta Meta. Subir la tasa 10 puntos baja el costo real alrededor de un 13%.
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />}

      {/* ============== COLA DE CONFIRMACION ============== */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Por confirmar</Typography>
        {pending.length > 0 && (
          <Chip size="small" label={pending.length}
            sx={{ bgcolor: '#FFF6E5', color: '#8A5A00', fontWeight: 700 }} />
        )}
      </Box>

      {oldestPendingHours != null && oldestPendingHours >= 12 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Hay un pedido esperando confirmacion desde hace <strong>{oldestPendingHours} horas</strong>.
          Cuanto mas tiempo pasa, mas baja la probabilidad de que el cliente responda.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
          {[0, 1].map((i) => <Skeleton key={i} variant="rounded" height={96} sx={{ borderRadius: 3 }} />)}
        </Box>
      ) : pending.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3, mb: 5 }}>
          <CheckCircle size={28} color="#1B7F4F" aria-hidden="true" />
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
            Todo confirmado. Nada pendiente por despachar.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 5 }}>
          {pending.map((order) => {
            const h = hoursSince(order.creation)
            return (
              <Box key={order.id} sx={{
                p: 2.5, borderRadius: 3, border: '1px solid',
                borderColor: h != null && h >= 12 ? '#E8C88A' : 'divider',
                bgcolor: h != null && h >= 12 ? '#FFFBF2' : 'transparent',
              }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 220 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                      {order.customerName || 'Sin nombre'}
                      <Typography component="span" sx={{ ml: 1, fontSize: 12, color: 'text.disabled' }}>
                        #{order.externalOrderId ?? order.id}
                      </Typography>
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {order.customerPhone} · {order.shippingCity}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>
                      {order.shippingAddress}
                    </Typography>
                    {(order.items ?? []).map((it, i) => (
                      <Typography key={i} sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                        {it.quantity} x {it.productName}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{money(order.total)}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                      {order.paymentMethod === 'COD' ? 'Contra entrega' : 'Pagado'}
                      {h != null && ` · hace ${h}h`}
                    </Typography>
                    {order.utmCampaign && (
                      <Chip size="small" label={order.utmCampaign}
                        sx={{ mt: 0.5, fontSize: 10, height: 20 }} />
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" startIcon={<MessageCircle size={15} />}
                    href={whatsappUrl(order)} target="_blank" rel="noopener"
                    disabled={!order.customerPhone}
                    sx={{ borderRadius: 999, textTransform: 'none', borderColor: '#128C7E', color: '#128C7E' }}>
                    Escribir por WhatsApp
                  </Button>
                  <Button size="small" variant="contained" startIcon={<CheckCircle size={15} />}
                    onClick={() => confirm(order)} disabled={busyId === order.id}
                    sx={{ borderRadius: 999, textTransform: 'none', bgcolor: '#1B7F4F' }}>
                    Confirmar
                  </Button>
                  <Button size="small" startIcon={<XCircle size={15} />}
                    onClick={() => setCancelTarget(order)} disabled={busyId === order.id}
                    sx={{ borderRadius: 999, textTransform: 'none', color: '#B3261E' }}>
                    Cancelar
                  </Button>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}

      {/* ============== TODOS LOS PEDIDOS ============== */}
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 2 }}>Todos los pedidos</Typography>

      {loading ? (
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      ) : all.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3 }}>
          <Package size={28} color="#9ca3af" aria-hidden="true" />
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
            Aun no hay pedidos. Llegaran solos cuando alguien compre en la tienda.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {all.map((order) => {
            const s = STATUS_STYLE[order.status] ?? DEFAULT_STYLE
            return (
              <Box key={order.id} sx={{
                p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap',
              }}>
                <Chip size="small" label={s.label}
                  sx={{ bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: 11, minWidth: 110 }} />
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    {order.customerName || 'Sin nombre'}
                    <Typography component="span" sx={{ ml: 1, fontSize: 12, color: 'text.disabled' }}>
                      #{order.externalOrderId ?? order.id}
                    </Typography>
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {order.shippingCity} · {order.source ?? 'TIENDA'}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                  {money(order.total)}
                </Typography>
              </Box>
            )
          })}
        </Box>
      )}

      {/* ============== DIALOGO DE CANCELACION ============== */}
      <Dialog open={cancelTarget != null} onClose={() => setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancelar pedido</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            El motivo es obligatorio. Sin el no se puede saber por que se pierden los
            pedidos, y sin saberlo no se puede mejorar la tasa de entrega.
          </Typography>
          <TextField
            fullWidth autoFocus multiline rows={2}
            label="Motivo"
            placeholder="No contesta, desistio, sin stock, direccion errada..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelTarget(null)} sx={{ textTransform: 'none' }}>Volver</Button>
          <Button variant="contained" onClick={doCancel} disabled={!cancelReason.trim()}
            sx={{ textTransform: 'none', bgcolor: '#B3261E' }}>
            Cancelar pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
