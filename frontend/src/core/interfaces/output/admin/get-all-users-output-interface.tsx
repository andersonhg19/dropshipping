export interface GetUsersAllOutputInterface {
  id: string
  idCompany: string
  idSubsidiary: number | null
  idModifiedBy: number | null
  idTypeUser: number | null
  name: string
  lastName: string
  email: string
  dni: string
  cellphone: string
  active: boolean | null
  size: number
  page: number
}
