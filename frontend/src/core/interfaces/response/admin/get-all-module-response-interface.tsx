export interface GetAllModuleResponseInterface {
  correct?: boolean
  message: string
  errorCode: number
  object: {
    page: number
    size: number
    totalPage: number
    list: ModuleDetailInterface[]
  }
}

export interface ModuleDetailInterface {
  id: string | number | null
  name: string | number | null
  idModifiedBy: string | number | null
  modifiedBy: string | null
  active: boolean | null
}
