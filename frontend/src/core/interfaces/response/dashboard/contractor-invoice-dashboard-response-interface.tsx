export interface ContractorInvoiceDashboardResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: ContractorInvoiceDashboardData | null
}

export interface ContractorInvoiceDashboardData {
  summary: DashboardSummary
  invoicesByStatus: InvoiceStatusSummary[]
  recentStatusChanges: RecentStatusChange[]
  upcomingPayments: UpcomingPayment[]
  invoicesByContractor?: ContractorSummary[] // Solo si NO se filtró por idContractor
  contractorSummary?: SingleContractorSummary // Solo si SÍ se filtró por idContractor
}

export interface DashboardSummary {
  totalInvoices: number
  totalAmount: number
  pendingInvoices: number
  pendingAmount: number
  paidInvoices: number
  paidAmount: number
  cancelledInvoices: number
  cancelledAmount: number
}

export interface InvoiceStatusSummary {
  status: string // key del enumerador (ej: "PENDIENTE_ENTREGA")
  statusName: string // nombre traducido
  count: number
  amount: number
}

export interface RecentStatusChange {
  invoiceId: number
  invoiceNumber: string
  contractorName: string
  previousStatus: string
  currentStatus: string
  statusChangeDate: string
  invoiceAmount: number
}

export interface UpcomingPayment {
  invoiceId: number
  invoiceNumber: string
  contractorName: string
  paymentDueDate: string
  invoiceAmount: number
  daysUntilDue: number
}

export interface ContractorSummary {
  contractorId: number
  contractorName: string
  totalInvoices: number
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  cancelledAmount: number
}

export interface SingleContractorSummary {
  contractorId: number
  contractorName: string
  totalInvoices: number
  totalAmount: number
  pendingInvoices: number
  pendingAmount: number
  paidInvoices: number
  paidAmount: number
  cancelledInvoices: number
  cancelledAmount: number
}
