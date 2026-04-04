export interface GetAllFilialResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: ObjectFilialResponse
}

export interface ObjectFilialResponse {
  page: number
  size: number
  totalPage: number
  list: FilialsDetailsResponse[]
}

export interface FilialsDetailsResponse {
  id: number | string | null
  idCompany: number | string | null
  companyName: string
  idModifiedBy: number | string | null
  modifiedBy: string | null
  name: string
  nit: string
  address: string
  legalRepresentative: string
  email: string
  phone: string
  image: string | null
  active: boolean
}
