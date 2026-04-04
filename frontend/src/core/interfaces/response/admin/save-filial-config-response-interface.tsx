export interface FilialConfigDetail {
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

export interface SaveFilialConfigObjectResponse {
  successful: FilialConfigDetail[]
  wrong: any[] // Puedes definir la estructura de 'wrong' si te llegan errores estructurados
}

export interface SaveFilialConfigResponseInterface {
  correct: boolean
  message: string
  errorCode: number
  object: SaveFilialConfigObjectResponse
}
