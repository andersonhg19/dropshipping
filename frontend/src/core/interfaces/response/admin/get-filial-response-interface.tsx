export interface GetFilialResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: {
    page: number
    size: number
    totalPage: number
    subsidiaryDTOList: FilialsDetailsResponse
  }
}

export interface FilialsDetailsResponse {
  id: number
  idCompany: number
  companyName: string
  idModifiedBy: number
  modifiedBy: string
  name: string
  nit: string
  address: string
  legalRepresentative: string
  email: string
  phone: string
  image: string
  active: boolean
}
