export interface UserResponseInterface {
  id: string
  idCompany: string
  companyName: string
  idSubsidiary: number
  subsidiaryName: string
  name: string
  lastName: string
  email: string
  cellphone: string
  idTypeUser: string
  typeName: string
  isSeller: boolean
  idUser: string
  supervisorStoresList: string[]
  active: boolean
  admin: boolean
  idDoctor?: number | null // ID del doctor asociado al usuario (si aplica)
}

export interface LoginUserResponseInterface {
  correct?: boolean
  message: string
  errorCode?: number
  object: UserResponseInterface | null
}
