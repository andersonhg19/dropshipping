import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_COMMERCE_CATEGORY } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { GenericSaveResponse } from '@api/generic-response'

async function SaveCategoryApi(ae_object: Record<string, any>): Promise<GenericSaveResponse> {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }

  try {
    const options = {
      method: 'post',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: ae_object.id || '',
        name: ae_object.name || '',
        parentId: ae_object.parentId || '',
        icon: ae_object.icon || '',
        active: ae_object.active,
        idModifiedBy: ae_object.idModifiedBy || '',
      }),
    }

    const data = await RawFetchData<GenericSaveResponse>(BASE_URL_COMMERCE_CATEGORY, 'save', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<GenericSaveResponse | undefined>
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

export { SaveCategoryApi }
