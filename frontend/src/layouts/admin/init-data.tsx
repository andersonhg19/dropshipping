import { TypeUserDTOInterface } from '@interfaces/response/admin/get-all-type-user-response-interface'
import { UserDTOInterface } from '@interfaces/response/admin/get-all-users-response-interface'

export const TypeUserInitData: TypeUserDTOInterface = {
  id: null,
  name: '',
  idCompany: null,
  idSubsidiary: null,
  idModifiedBy: null,
  active: true,
  companyName: '',
  subsidiaryName: null,
  size: 10,
  page: 0,
}

export const UserInitData: UserDTOInterface = {
  id: '',
  idTypeUser: '',
  idCompany: null,
  idSubsidiary: 0,
  name: '',
  lastName: '',
  email: '',
  dni: '',
  cellphone: '',
  active: true,
  size: 10,
  page: 0,
}
