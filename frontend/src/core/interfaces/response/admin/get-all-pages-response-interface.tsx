export interface GetAllPagesResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: PageData
}

export interface PageData {
  object: any
  page: number
  size: number
  totalPage: number
  list: PageDTO[]
}

export interface PageDTO {
  id: string
  npage: string
  icon: string
  name: string
  idModifiedBy: string
  modifiedBy: string
  idModule: string
  moduleName: string
  active: boolean
}
