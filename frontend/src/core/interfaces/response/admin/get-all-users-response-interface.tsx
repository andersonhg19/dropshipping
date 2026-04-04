export interface UserDTOInterface {
  id: string
  idCompany: string | null
  companyName?: string | null
  idSubsidiary: number | null
  subsidiaryName?: string | null
  idModifiedBy?: number | null
  modifiedBy?: string | null
  idTypeUser: string | null
  typeUserName?: string | null
  name: string
  lastName: string
  email: string
  dni: string
  cellphone: string
  password?: string
  active: boolean | null
  admin?: boolean | null
  page?: number
  size?: number
}

export interface ObjectDetailsUserInterface {
  page: number
  size: number
  totalPage: number
  list: UserDTOInterface[]
}

export interface GetAllUsersResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: ObjectDetailsUserInterface | null
}
