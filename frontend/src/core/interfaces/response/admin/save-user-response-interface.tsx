export interface SaveUserResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: objectSaveUser
}

export interface objectSaveUser {
  id: string
  idCompany: string
  companyName: string
  idSubsidiary: number
  subsidiaryName: string
  idModifiedBy?: string
  modifiedBy?: string
  idTypeUser: string
  typeUserName: string
  name: string
  lastName: string
  email: string
  dni: string
  cellphone: string
  password: string
  active: boolean
}
