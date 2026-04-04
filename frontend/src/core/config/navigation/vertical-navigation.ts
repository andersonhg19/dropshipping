import React from 'react'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddBusinessIcon from '@mui/icons-material/AddBusiness'
import BusinessIcon from '@mui/icons-material/Business'
// import FindInPageIcon from '@mui/icons-material/FindInPage';
import ContactPageIcon from '@mui/icons-material/ContactPage'
import EmergencyIcon from '@mui/icons-material/Emergency'
import FolderSharedIcon from '@mui/icons-material/FolderShared'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import InsightsIcon from '@mui/icons-material/Insights'
import InventoryIcon from '@mui/icons-material/Inventory'
import TableChartIcon from '@mui/icons-material/TableChart'
import PaidIcon from '@mui/icons-material/Paid'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import ReceiptIcon from '@mui/icons-material/Receipt'
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle'
// import BarChartIcon from '@mui/icons-material/BarChart'
// import DashboardIcon from '@mui/icons-material/Dashboard'
// import DescriptionIcon from '@mui/icons-material/Description'
// import LayersIcon from '@mui/icons-material/Layers'
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
// import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
// import { UserIcon } from 'lucide-react'
// import { TypeIcon } from 'lucide-react'
// import { CopyIcon } from 'lucide-react'
// import { ListIcon } from 'lucide-react'

import { LayoutDashboard } from 'lucide-react'
import { ShieldIcon } from 'lucide-react'
import { HeartPulse } from 'lucide-react'
import { ClipboardCheck } from 'lucide-react'

export type NavItem = {
  kind?: 'divider' | 'header'
  segment?: string
  title?: string
  icon?: any
  children?: NavItem[]
  [k: string]: any
}

export function buildVerticalNavigation(t: (k: string) => string): NavItem[] {
  const labels = {
    mainItems: t('lbl_mainItems'),

    dashboard: t('lbl_dashboard'),
    admin: t('lbl_admin'),
    company: t('lbl_company'),
    filial: t('lbl_filial'),
    users: t('lbl_users'),
    typeUsers: t('lbl_roles'),
    pagesTypeUser: t('lbl_permissions'),

    health: t('lbl_health'),
    doctor: t('lbl_doctor'),
    contractor: t('lbl_contractor'),
    contractorInvoiceStatus: t('lbl_contractor_invoice_status'),
    contractorProcedure: t('lbl_contractor_procedure'),
    medicalProcedure: t('lbl_medical_procedure'),
    medicalTransaction: t('lbl_medical_transaction'),
    service: t('lbl_service'),
    dashboardDoctor: t('lbl_dashboard_doctor'),
    excelFieldMapping: t('lbl_excel_field_mapping'),
    doctorIncome: t('lbl_doctor_income'),

    finance: t('lbl_finance'),
    costCenter: t('lbl_cost_center'),
    incomeExpense: t('lbl_income_expense'),

    logs: t('lbl_logs'),
  }

  const dashboardIcon = React.createElement(LayoutDashboard)
  const AdminIcon = React.createElement(ShieldIcon)
  const CompanyIcon = React.createElement(AddBusinessIcon)
  const userIcon = React.createElement(AccountCircleIcon)
  const userTypeIcon = React.createElement(SupervisedUserCircleIcon)
  // const fileIcon = React.createElement(FindInPageIcon)
  const pageTypeUser = React.createElement(ContactPageIcon)
  const FilialIcon = React.createElement(BusinessIcon)

  const healthIcon = React.createElement(HeartPulse)
  const doctorIcon = React.createElement(FolderSharedIcon)
  const contractorIcon = React.createElement(HealthAndSafetyIcon)
  const contractorInvoiceStatusIcon = React.createElement(ReceiptIcon)
  const contractorProcedureIcon = React.createElement(ManageAccountsIcon)
  const medicalProcedureIcon = React.createElement(MonitorHeartIcon)
  const medicalTransactionIcon = React.createElement(EmergencyIcon)
  const serviceIcon = React.createElement(HealthAndSafetyIcon)

  const financeIcon = React.createElement(ReceiptIcon)
  const costCenterIcon = React.createElement(ReceiptIcon)
  const incomeExpenseIcon = React.createElement(ManageAccountsIcon)
  const dashboardDoctorIcon = React.createElement(InsightsIcon)
  const excelFieldMappingIcon = React.createElement(TableChartIcon)
  const doctorIncomeIcon = React.createElement(PaidIcon)

  const logsIcon = React.createElement(ClipboardCheck)

  return [
    // { kind: 'header', title: labels.mainItems },
    {
      segment: 'dashboard',
      title: labels.dashboard,
      icon: dashboardIcon,
    },
    { kind: 'divider' },
    // { kind: 'header', title: t('lbl_administration') },
    {
      segment: 'dashboard/admin',
      icon: AdminIcon,
      title: labels.admin,
      children: [
        {
          segment: 'company',
          title: labels.company,
          icon: CompanyIcon,
        },
        {
          segment: 'filial',
          title: labels.filial,
          icon: FilialIcon,
        },
        {
          segment: 'user',
          title: labels.users,
          icon: userIcon,
        },
        {
          segment: 'type-user',
          title: labels.typeUsers,
          icon: userTypeIcon,
        },
        {
          segment: 'page-type-user',
          title: labels.pagesTypeUser,
          icon: pageTypeUser,
        },
      ],
    },
    { kind: 'divider' },
    // { kind: 'header', title: t('lbl_health') },
    {
      segment: 'dashboard/health',
      title: labels.health,
      icon: healthIcon,
      children: [
        {
          segment: 'doctor',
          title: labels.doctor,
          icon: doctorIcon,
        },
        {
          segment: 'contractor',
          title: labels.contractor,
          icon: contractorIcon,
        },
        {
          segment: 'contractor-invoice-status',
          title: labels.contractorInvoiceStatus,
          icon: contractorInvoiceStatusIcon,
        },
        {
          segment: 'contractor-procedure',
          title: labels.contractorProcedure,
          icon: contractorProcedureIcon,
        },
        {
          segment: 'medical-procedure',
          title: labels.medicalProcedure,
          icon: medicalProcedureIcon,
        },
        {
          segment: 'medical-transaction',
          title: labels.medicalTransaction,
          icon: medicalTransactionIcon,
        },
        {
          segment: 'service',
          title: labels.service,
          icon: serviceIcon,
        },
        {
          segment: 'dashboard-doctor',
          title: labels.dashboardDoctor,
          icon: dashboardDoctorIcon,
        },
        {
          segment: 'excel-field-mapping',
          title: labels.excelFieldMapping,
          icon: excelFieldMappingIcon,
        },
        {
          segment: 'doctor-income',
          title: labels.doctorIncome,
          icon: doctorIncomeIcon,
        },
      ],
    },
    { kind: 'divider' },
    {
      segment: 'dashboard/finance',
      title: labels.finance,
      icon: financeIcon,
      children: [
        {
          segment: 'cost-center',
          title: labels.costCenter,
          icon: costCenterIcon,
        },
        {
          segment: 'income-expense',
          title: labels.incomeExpense,
          icon: incomeExpenseIcon,
        },
      ],
    },

    { kind: 'divider' },
    // { kind: 'header', title: t('lbl_logs') },
    {
      segment: 'dashboard/logs',
      title: labels.logs,
      icon: logsIcon,
    },
  ]
}
