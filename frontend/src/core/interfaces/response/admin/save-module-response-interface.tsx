export interface SaveModuleResponseInterface {
  correct: boolean | null
  message: string | null
  errorCode: number | null
  object: ModuleresponseInterface | null
}

export interface ModuleresponseInterface {
  id: string | number | null
  name: string | number | null
  idModifiedBy: string | number | null
  modifiedBy: string | null
  active: boolean | null
}
