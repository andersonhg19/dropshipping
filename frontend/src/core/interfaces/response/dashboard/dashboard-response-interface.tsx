export interface MonthlyIncomeDTO {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  incomeByCostCenter: CostCenterIncomeDTO[] | null
  expensesByCostCenter: CostCenterExpenseDTO[] | null
}

export interface CostCenterIncomeDTO {
  idCostCenter: number | null
  costCenterCode: string | null
  costCenterName: string | null
  totalIncome: number
}

export interface CostCenterExpenseDTO {
  idCostCenter: number | null
  costCenterCode: string | null
  costCenterName: string | null
  totalExpenses: number
}

export interface BillingByPolicyDTO {
  totalBilling: number
  billingByContractor: ContractorBillingDetail[] | null
  contractorBilling: ContractorBillingDetail | null
}

export interface ContractorBillingDetail {
  idContractor: number
  contractorNit: string
  contractorName: string
  totalBilling: number
  transactionCount: number
}

export interface ConsultationTypeCountDTO {
  totalConsultations: number
  totalValue: number
  consultationsByProcedure: ProcedureConsultationDetail[] | null
  procedureData: ProcedureConsultationDetail | null
}

export interface ProcedureConsultationDetail {
  idMedicalProcedure: number
  procedureCode: string
  procedureName: string
  consultationCount: number
  totalValue: number
}

export interface DoctorProfitDTO {
  totalProfit: number
  profitByDoctor: DoctorProfitDetail[] | null
  doctorProfit: DoctorProfitDetail | null
}

export interface DoctorProfitDetail {
  idDoctor: number
  doctorName: string
  doctorDocument: string
  specialty: string
  totalNeuroPlusCommission: number
  totalDoctorCommission: number
  totalValue: number
  totalConsultations: number
  proceduresBreakdown: DoctorProcedureDetail[]
}

export interface DoctorProcedureDetail {
  idMedicalProcedure: number
  procedureCode: string
  procedureName: string
  transactionType: string
  consultationCount: number
  totalValue: number
  neuroPlusCommission: number
  doctorCommission: number
}

export interface ContractorIncomeDTO {
  totalIncome: number
  incomeByContractor: ContractorIncomeDetail[] | null
  contractorIncome: ContractorIncomeDetail | null
}

export interface ContractorIncomeDetail {
  idContractor: number
  contractorNit: string
  contractorName: string
  totalNeuroPlusCommission: number
  totalValue: number
  totalTransactions: number
}

export interface CostCenterIncomeExpenseDTO {
  totalIncome: number
  totalExpenses: number
  netBalance: number
  balanceByCostCenter: CostCenterIncomeExpenseDetail[] | null
  costCenterBalance: CostCenterIncomeExpenseDetail | null
}

export interface CostCenterIncomeExpenseDetail {
  idCostCenter: number
  costCenterCode: string
  costCenterName: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
}

export interface DashboardResponseDTO {
  monthlyIncome: MonthlyIncomeDTO
  billingByPolicy: BillingByPolicyDTO
  consultationTypeCount: ConsultationTypeCountDTO
  doctorProfit: DoctorProfitDTO
  contractorIncome: ContractorIncomeDTO
  costCenterIncomeExpense: CostCenterIncomeExpenseDTO
}

// Respuestas individuales
export interface MonthlyIncomeResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: MonthlyIncomeDTO | null
}

export interface BillingByPolicyResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: BillingByPolicyDTO | null
}

export interface ConsultationTypeCountResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: ConsultationTypeCountDTO | null
}

export interface DoctorProfitResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: DoctorProfitDTO | null
}

export interface ContractorIncomeResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: ContractorIncomeDTO | null
}

export interface CostCenterIncomeExpenseResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: CostCenterIncomeExpenseDTO | null
}

export interface DashboardCompleteResponseInterface {
  correct: boolean
  message: string
  errorCode?: number
  object: DashboardResponseDTO | null
}
