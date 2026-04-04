export interface ContractorInvoiceDashboardFilterOutputInterface {
  companyId: number
  subsidiaryId: number
  startDate: string // ISO 8601 format
  endDate: string // ISO 8601 format
  idContractor?: number | null // Opcional, si se envía filtra todo el dashboard para ese contratista específico
}
