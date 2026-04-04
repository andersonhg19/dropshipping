export interface SaveCompanyOutputInterface {
  id: string | number
  name: string
  nit: string
  address: string
  legalRepresentative: string
  contactPerson: string
  phone: string
  email: string
  active: boolean
  idModifiedBy: string | number
}
