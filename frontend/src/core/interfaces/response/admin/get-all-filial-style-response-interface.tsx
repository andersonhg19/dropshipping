export interface GetAllFilialStyleResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: {
    page: number
    size: number
    totalPage: number
    list: ListFilialStyleResponseInterface[]
  }
}

interface ListFilialStyleResponseInterface {
  id: string
  idCompany: string
  companyName: string
  idSubsidiary: number
  subsidiaryName: string
  idModifiedBy: string
  modifiedBy: string
  name: string
  value: string
  type: string
  typeValue: string
  active: boolean
}
