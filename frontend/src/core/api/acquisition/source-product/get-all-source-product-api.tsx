import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ACQUISITION_SOURCE_PRODUCT } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { GenericPageResponse } from '@api/generic-response'

async function GetAllSourceProduct(ae_object: Record<string, any>): Promise<GenericPageResponse> {
  try {
    const token = await getKeyApi()
    if (!token) {
      return {
        correct: false,
        message: i18n.t('errorTokenAPI') as string,
        errorCode: 102,
        object: null,
      }
    }

    const options: RequestInit = {
      method: 'POST',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: ae_object.id ?? '',
        title: ae_object.title ?? '',
        sourceName: ae_object.sourceName ?? '',
        imported: ae_object.imported ?? '',
        active: ae_object.active ?? true,
        page: ae_object.page ?? 0,
        size: ae_object.size ?? 100,
      }),
    }

    const data = await RawFetchData<GenericPageResponse>(BASE_URL_ACQUISITION_SOURCE_PRODUCT, 'all', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<GenericPageResponse | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      }
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    }
  }
}

export { GetAllSourceProduct }
