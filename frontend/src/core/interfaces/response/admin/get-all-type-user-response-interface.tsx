export interface GetAllTypeUserResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: ObjectDetailsTypeuserInterface | null
}

export interface ObjectDetailsTypeuserInterface {
  page: number
  size: number
  totalPage: number
  list: TypeUserDTOInterface[]
}

export interface TypeUserDTOInterface {
  id: number | null
  idCompany: number | null
  companyName?: string
  idSubsidiary: number | null
  subsidiaryName?: string | null
  idModifiedBy?: number | null
  modifiedBy?: string | null
  name: string | null
  active: boolean | null
  size?: number | null
  page?: number | null
}
