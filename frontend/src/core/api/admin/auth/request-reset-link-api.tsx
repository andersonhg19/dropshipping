import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_PASSWORD } from '@api/api-path'
import { GetToken } from '@api/auth/get-token'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

export async function requestResetLinkApi(email: string) {
  const token = await GetToken()
  if (!token) return { correct: false, message: i18n.t('errorTokenAPI'), errorCode: 102, object: null }

  const options: RequestInit = {
    method: 'post',
    mode: 'cors' as RequestMode,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      lng: i18n.language,
    },
    body: JSON.stringify({ email }),
  }

  try {
    // Si usas el controlador nuevo:
    return await RawFetchData(BASE_URL_ADMINISTRATION_PASSWORD, 'forgot', options)
  } catch (err) {
    const http = err as RawHttpError<any>
    return { correct: false, message: i18n.t('lbl_error_unexpected'), errorCode: http?.status ?? 500, object: null }
  }
}
