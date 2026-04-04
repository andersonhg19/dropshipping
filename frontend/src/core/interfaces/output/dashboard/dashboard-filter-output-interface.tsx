export interface DashboardFilterOutputInterface {
  companyId: number
  subsidiaryId: number
  startDate: string // ISO 8601 format: "2025-01-01T00:00:00"
  endDate: string // ISO 8601 format: "2025-12-31T23:59:59"
  idDoctor?: number | null
  idUserDoctor?: number | null
  idContractor?: number | null
  idMedicalProcedure?: number | null
  idCostCenter?: number | null
}
