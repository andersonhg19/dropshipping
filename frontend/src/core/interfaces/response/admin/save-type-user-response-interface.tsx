export interface SaveTypeUserResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: objectSaveTypeUser
}

export interface objectSaveTypeUser {
  id: string
  name: string
  active: boolean
  idUser: string
  nameUser: string
  idSubsidiary: number
  nameSubsidiary: string
  idCompany: string
  nameCompany: string
}
