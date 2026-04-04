'use client'

import { pageReadAllowed } from '@utils/utilities'

import { nPage } from '@config/navigation/npage'

const segmentToNpage: Record<string, string> = {
  dashboard: nPage.tablero,
  'dashboard/admin/company': nPage.admin.empresa,
  'dashboard/admin/filial': nPage.admin.filial,
  'dashboard/admin/user': nPage.admin.usuario,
  'dashboard/admin/type-user': nPage.admin.roles,
  'dashboard/admin/page-type-user': nPage.admin.permisos,
  'dashboard/logs': nPage.audit.logs,
}

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
        out.push(it)
        continue
      }

      const fullSeg = it.segment ? (parentSeg ? `${parentSeg}/${it.segment}` : it.segment) : parentSeg
      const nkey = fullSeg ? segmentToNpage[fullSeg] : undefined
      const selfAllowed = nkey ? pageReadAllowed(nkey) : true

      const kids = Array.isArray(it.children) ? prune(it.children, fullSeg) : undefined
      const hadOriginalChildren = Array.isArray(it.children) && it.children.length > 0
      const hasVisibleKids = kids && kids.length > 0

      if (hadOriginalChildren && !hasVisibleKids) continue
      if (!selfAllowed && !hasVisibleKids) continue

      const next: NavItem = { ...it }
      if (kids) next.children = kids
      out.push(next)
    }

    return cleanDividers(out)
  }

  const filtered = prune(rawNav)
  return cleanDividers(filtered)
}

export function canAccessMainDashboard(): boolean {
  return pageReadAllowed(nPage.tablero)
}
