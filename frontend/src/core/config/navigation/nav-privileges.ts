'use client'

import { pageReadAllowed } from '@utils/utilities'

import { nPage } from '@config/navigation/npage'

// Nota: la navegación de Toolpad arma rutas con el "segment" del padre + hijo.
// Este mapa usa el path completo de segmentos como clave.
const segmentToNpage: Record<string, string> = {
  dashboard: nPage.tablero,
  'dashboard/admin/company': nPage.admin.empresa,
  'dashboard/admin/filial': nPage.admin.filial,
  'dashboard/admin/user': nPage.admin.usuario,
  'dashboard/admin/type-user': nPage.admin.roles,
  'dashboard/admin/page-type-user': nPage.admin.permisos,

  'dashboard/health/doctor': nPage.health.medico,
  'dashboard/health/contractor': nPage.health.contratista,
  'dashboard/health/contractor-invoice-status': nPage.health.estadoFacturaContratista,
  'dashboard/health/contractor-procedure': nPage.health.procedimientoContratista,
  'dashboard/health/medical-procedure': nPage.health.procedimientoMedico,
  'dashboard/health/medical-transaction': nPage.health.transaccionMedica,
  'dashboard/health/procedure-supply': nPage.health.procedimientoInsumo,
  'dashboard/health/service': nPage.health.service,
  'dashboard/health/excel-field-mapping': nPage.health.excelFieldMapping,
  'dashboard/health/doctor-income': nPage.health.doctorIncome,

  'dashboard/finance/cost-center': nPage.finance.costCenter,
  'dashboard/finance/income-expense': nPage.finance.incomeExpense,
  'dashboard/health/dashboard-doctor': nPage.health.dashboardDoctor,

  'dashboard/logs': nPage.audit.logs,
}

// Tipo mínimo para no acoplarse a Toolpad
type NavItem = {
  kind?: 'divider' | 'header'
  segment?: string
  title?: string
  icon?: any
  children?: NavItem[]
  [k: string]: any
}

const cleanDividers = (items: NavItem[]) =>
  items.filter((v, i, arr) => {
    if (v.kind !== 'divider') return true
    const prevIsDivider = arr[i - 1]?.kind === 'divider'
    const nextIsDivider = arr[i + 1]?.kind === 'divider' || i === arr.length - 1
    return !prevIsDivider && !nextIsDivider
  })

export function getFilteredNavigation(rawNav: NavItem[]): NavItem[] {
  const prune = (items: NavItem[], parentSeg = ''): NavItem[] => {
    const out: NavItem[] = []

    for (const it of items) {
      if (it.kind === 'divider' || it.kind === 'header') {
        // de momento los mantenemos; se "limpian" al final
        out.push(it)
        continue
      }

      const fullSeg = it.segment ? (parentSeg ? `${parentSeg}/${it.segment}` : it.segment) : parentSeg
      const nkey = fullSeg ? segmentToNpage[fullSeg] : undefined
      const selfAllowed = nkey ? pageReadAllowed(nkey) : true

      // Filtrar hijos recursivamente
      const kids = Array.isArray(it.children) ? prune(it.children, fullSeg) : undefined
      const hadOriginalChildren = Array.isArray(it.children) && it.children.length > 0
      const hasVisibleKids = kids && kids.length > 0

      // REGLA 1: Si el ítem tenía hijos originalmente pero ya no tiene hijos visibles después del filtrado,
      // entonces el módulo padre debe ocultarse (ej: Admin sin páginas accesibles)
      if (hadOriginalChildren && !hasVisibleKids) {
        continue
      }

      // REGLA 2: Si el ítem no tiene permiso propio y no tiene hijos visibles, se oculta
      if (!selfAllowed && !hasVisibleKids) {
        continue
      }

      const next: NavItem = { ...it }
      if (kids) next.children = kids
      out.push(next)
    }

    return cleanDividers(out)
  }

  const filtered = prune(rawNav)
  return cleanDividers(filtered) // limpieza final
}

/**
 * Verifica si el usuario tiene acceso al dashboard principal
 */
export function canAccessMainDashboard(): boolean {
  return pageReadAllowed(nPage.tablero)
}

/**
 * Verifica si el usuario tiene acceso al dashboard del doctor
 */
export function canAccessDoctorDashboard(): boolean {
  return pageReadAllowed(nPage.health.dashboardDoctor)
}
