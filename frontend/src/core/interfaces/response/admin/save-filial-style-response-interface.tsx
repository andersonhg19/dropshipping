export interface FilialStyleDetail {
  id: string
  name: string
  value: string
  type: string
  typeValue: string
  active: boolean
}

export interface SaveFilialStyleObjectResponse {
  idCompany: number | string
  companyName: string
  idSubsidiary: number | string
  subsidiaryName: string
  idModifiedBy: number | string
  modifiedBy: string | null
  details: FilialStyleDetail[]
}

export interface SaveFilialStyleResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: SaveFilialStyleObjectResponse
}
