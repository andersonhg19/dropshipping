export interface GenericPageResponse {
  correct: boolean
  message: string
  errorCode: number
  object: {
    page: number
    size: number
    totalPage: number
    list: any[]
  } | null
}

export interface GenericSaveResponse {
  correct: boolean
  message: string
  errorCode: number
  object: any
}
