export interface SaveUserOutputInterface {
  id: number | null
  idCompany: number | null
  idSubsidiary: number | null
  idModifiedBy?: number | null
  idTypeUser: number | null
  name: string | null
  lastName: string | null
  email: string | null
  dni: string | null
  cellphone: string
  password?: string | null
  active: boolean
  admin: boolean
}
