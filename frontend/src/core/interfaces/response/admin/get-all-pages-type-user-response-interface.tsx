export interface GetAllPagesTypeUserResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: PageTypeUserData
}

export interface PageTypeUserData {
  page: number
  size: number
  totalPage: number
  list: PageTypeUserDTO[]
}

export interface PageTypeUserDTO {
  id: number
  idPage: number | null
  pageName: string
  npage: string
  idTypeUser: number | null
  typeUserName: string
  idModifiedBy: number | null
  modifiedBy: string
  canCreate: boolean
  canUpdate: boolean
  canRead: boolean
  canDelete: boolean
  active: boolean
}
