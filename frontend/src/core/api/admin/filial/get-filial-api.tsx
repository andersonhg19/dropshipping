// src/core/api/admin/company/get-filial-by-id-api.ts
import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_FILIAL } from '@api/api-path'
import { RawFetchData, type RawHttpError } from '@api/raw-fetch-data'

import type { GetFilialResponseInterface } from '@interfaces/response/admin/get-filial-response-interface'

export async function GetFilialByIdApi(idSubsidiary: string | number): Promise<GetFilialResponseInterface> {
  const token = getKeyApi()
  if (token === '') {
    return {
      correct: false,
      message: i18n.t('errorTokenAPI') as string,
      errorCode: 102,
      object: null,
    } as unknown as GetFilialResponseInterface
  }
  try {
    const endpoint = String(idSubsidiary ?? '').trim()

    const options: RequestInit = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        lng: i18n.language,
      },
    }

    const data = await RawFetchData<GetFilialResponseInterface>(BASE_URL_ADMINISTRATION_FILIAL, endpoint, options)
    return data
  } catch (err) {
    const http = err as RawHttpError<GetFilialResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetFilialResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetFilialResponseInterface
  }
}
