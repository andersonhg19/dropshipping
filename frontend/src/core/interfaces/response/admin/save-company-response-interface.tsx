export interface SaveCompanyResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: CompanySaveDetailsResponse
}

export interface CompanySaveDetailsResponse {
  id: number
  name: string
  nit: string
  address: string
  legalRepresentative: string
  email: string
  phone: string
  active: boolean
  idModifiedBy: number | null
  modifiedBy: string | null
}
