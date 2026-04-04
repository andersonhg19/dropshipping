import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_UTILS } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { ReturnService } from '@api/return-service'

const GetTypeDocuments = async () => {
  const token = getKeyApi()
  if (token === '') {
    return new ReturnService('', false, i18n.t('errorTokenAPI'), 102)
  }
  try {
    const options: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        lng: i18n.language,
      },
    }

    const data = await RawFetchData<any>(BASE_URL_ADMINISTRATION_UTILS, 'type-documents', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<any | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as any
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as any
  }
}

export { GetTypeDocuments }
