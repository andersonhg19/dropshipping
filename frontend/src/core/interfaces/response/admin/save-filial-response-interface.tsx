export interface SaveFilialResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: FilialSaveDetailsResponse
}

export interface FilialSaveDetailsResponse {
  id: string | number
  idCompany: number
  companyName: string
  idModifiedBy: number | null
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
