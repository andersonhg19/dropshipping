export interface GetAllCompanyResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: ObjectCompanyResponse
}

export interface ObjectCompanyResponse {
  page: number
  size: number
  totalPage: number
  list: CompanyDetailsResponse[]
}

export interface CompanyDetailsResponse {
  id: string | number
  name: string
  nit: string
  address: string
  legalRepresentative: string
  contactPerson: string
  phone: string
  email: string
  active: boolean
  idModifiedBy: number | null
  modifiedBy: string | null
}
