export interface SavePageTypeUserResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: PagePermissionDetail[]
}

export interface PagePermissionDetail {
  id: string
  idPage: string
  namePages: string
  idTypeUser: string
  nameTypeUser: string
  idUser: string
  isCreate: boolean
  isUpdate: boolean
  active: boolean
}
