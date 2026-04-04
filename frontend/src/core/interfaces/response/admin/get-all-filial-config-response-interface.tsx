export interface GetAllFilialConfigResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: {
    page: number
    size: number
    totalPage: number
    list: ListFilialConfigResponseInterface[]
  }
}

interface ListFilialConfigResponseInterface {
  id: string
  idCompany: string
  nameCompany: string
  idSubsidiary: number
  nameSubsidiary: string
  type: string
  name: string
  value: string
  idUser: string
  nameUser: string
  active: boolean
}
