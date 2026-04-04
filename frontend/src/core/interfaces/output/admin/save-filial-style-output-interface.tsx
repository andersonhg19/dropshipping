export interface SaveFilialStyleDetail {
  id: string | number
  name: string
  value: string
  type: string
  typeValue?: string
  active: boolean
}

export interface SaveFilialStyleOutputInterface {
  id: string | number
  idSubsidiary: number | string
  idCompany: string | number
  idModifiedBy: string | number
  details: SaveFilialStyleDetail[]
}
