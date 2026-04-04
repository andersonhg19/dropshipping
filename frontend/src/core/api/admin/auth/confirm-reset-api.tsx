// @api/admin/auth/confirm-reset.ts
import { encrypt } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_PASSWORD } from '@api/api-path'
import { GetToken } from '@api/auth/get-token'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

export async function confirmResetApi(resetTokenFromUrl: string, newPasswordPlain: string) {
  const tkn = await GetToken()
  if (!tkn) return { correct: false, message: i18n.t('errorTokenAPI'), errorCode: 102, object: null }

  const encrypted = encrypt(newPasswordPlain)

  const options: RequestInit = {
    method: 'post',
    mode: 'cors' as RequestMode,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tkn}`,
      lng: i18n.language,
    },
    body: JSON.stringify({ token: resetTokenFromUrl, newPassword: encrypted }),
  }

  try {
    return await RawFetchData(BASE_URL_ADMINISTRATION_PASSWORD, 'reset', options)
  } catch (err) {
    const http = err as RawHttpError<any>
    return { correct: false, message: i18n.t('lbl_error_unexpected'), errorCode: http?.status ?? 500, object: null }
  }
}
