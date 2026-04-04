import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ACQUISITION_IMPORT_JOB } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { GenericSaveResponse } from '@api/generic-response'

async function SaveImportJobApi(ae_object: Record<string, any>): Promise<GenericSaveResponse> {
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
        fileName: ae_object.fileName || '',
        fileType: ae_object.fileType || '',
        idSupplier: ae_object.idSupplier || '',
        status: ae_object.status || '',
        active: ae_object.active,
        idModifiedBy: ae_object.idModifiedBy || '',
      }),
    }

    const data = await RawFetchData<GenericSaveResponse>(BASE_URL_ACQUISITION_IMPORT_JOB, 'save', options)

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

export { SaveImportJobApi }
