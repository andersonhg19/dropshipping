import React from 'react'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import BusinessIcon from '@mui/icons-material/Business'
import CategoryIcon from '@mui/icons-material/Category'
import ContactPageIcon from '@mui/icons-material/ContactPage'
import InventoryIcon from '@mui/icons-material/Inventory'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import PriceChangeIcon from '@mui/icons-material/PriceChange'
import PublishIcon from '@mui/icons-material/Publish'
import SearchIcon from '@mui/icons-material/Search'
import SettingsIcon from '@mui/icons-material/Settings'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import StorefrontIcon from '@mui/icons-material/Storefront'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
import UploadFileIcon from '@mui/icons-material/UploadFile'

import { ClipboardCheck, LayoutDashboard, ShieldIcon } from 'lucide-react'

export type NavItem = {
  kind?: 'divider' | 'header'
  segment?: string
  title?: string
  icon?: any
  children?: NavItem[]
  [k: string]: any
}

export function buildVerticalNavigation(t: (k: string) => string): NavItem[] {
  return [
    {
      segment: 'dashboard',
      title: t('lbl_dashboard'),
      icon: React.createElement(LayoutDashboard),
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/products',
      title: t('lbl_products'),
      icon: React.createElement(InventoryIcon),
      children: [
        { segment: 'list', title: t('lbl_products'), icon: React.createElement(InventoryIcon) },
        { segment: 'categories', title: t('lbl_categories'), icon: React.createElement(CategoryIcon) },
        { segment: 'pricing', title: t('lbl_pricing'), icon: React.createElement(PriceChangeIcon) },
      ],
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/sources',
      title: t('lbl_sources'),
      icon: React.createElement(SearchIcon),
      children: [
        { segment: 'suppliers', title: t('lbl_supplier'), icon: React.createElement(LocalShippingIcon) },
        { segment: 'search', title: t('lbl_search'), icon: React.createElement(SearchIcon) },
        { segment: 'import', title: 'Importar', icon: React.createElement(UploadFileIcon) },
      ],
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/enrichment',
      title: 'IA',
      icon: React.createElement(SmartToyIcon),
      children: [
        { segment: 'config', title: 'Configuracion IA', icon: React.createElement(SettingsIcon) },
        { segment: 'templates', title: 'Templates', icon: React.createElement(SmartToyIcon) },
      ],
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/publish',
      title: t('lbl_publish'),
      icon: React.createElement(PublishIcon),
      children: [
        { segment: 'channels', title: 'Canales', icon: React.createElement(StorefrontIcon) },
        { segment: 'wordpress', title: t('lbl_wordpress'), icon: React.createElement(StorefrontIcon) },
      ],
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/admin',
      title: t('lbl_admin'),
      icon: React.createElement(ShieldIcon),
      children: [
        { segment: 'company', title: t('lbl_company'), icon: React.createElement(AddBusinessIcon) },
        { segment: 'filial', title: t('lbl_filial'), icon: React.createElement(BusinessIcon) },
        { segment: 'user', title: t('lbl_users'), icon: React.createElement(AccountCircleIcon) },
        { segment: 'type-user', title: t('lbl_roles'), icon: React.createElement(SupervisedUserCircleIcon) },
        { segment: 'page-type-user', title: t('lbl_permissions'), icon: React.createElement(ContactPageIcon) },
      ],
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/logs',
      title: t('lbl_logs'),
      icon: React.createElement(ClipboardCheck),
    },
  ]
}
