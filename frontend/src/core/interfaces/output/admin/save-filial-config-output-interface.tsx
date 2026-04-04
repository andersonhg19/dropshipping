export interface SaveFilialConfigDetail {
  id: string
  name: string
  type: string
  value: string
  active: boolean
}

export interface SaveFilialConfigOutputInterface {
  id: string
  idSubsidiary: number
  idCompany: string
  idModifiedBy: string
  details: SaveFilialConfigDetail[]
}
