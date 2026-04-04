export interface LoginResponse {
  correct?: boolean
  message: string
  errorCode?: number
  object: objectResponse | null
}

interface objectResponse {
  token: string
  username: string
}
