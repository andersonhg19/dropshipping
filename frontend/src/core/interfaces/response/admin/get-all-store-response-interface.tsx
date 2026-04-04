export interface GetAllStoreResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: ObjectDetailsStoreInterface | null
}

export interface ObjectDetailsStoreInterface {
  page: number
  size: number
  totalPage: number
  storeDTOList: StoreDTOInterface[]
}

export interface StoreDTOInterface {
  id: string
  name: string
  numberStore: string
  idCompany: string
  nameCompany: string
  idSubsidiary: number
  nameSubsidiary: string
  idUser: string | null
  idCountry: string | null
  nameCountry: string
  address: string
  phone: string
  contactPerson: string
  mail: string
  state: boolean
  latitude: string
  longitude: string
}
