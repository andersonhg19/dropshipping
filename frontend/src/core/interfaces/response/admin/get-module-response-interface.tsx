export interface GetModuleResponseInterface {
  correct: boolean | null
  message: string | null
  errorCode: number | null
  object: ModuleDetailInterface | null
}

export interface ModuleDetailInterface {
  id: string | number | null
  name: string | number | null
  idModifiedBy: string | number | null
  modifiedBy: string | null
  active: boolean | null
}
