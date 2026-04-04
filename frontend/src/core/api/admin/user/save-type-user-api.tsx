import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_TYPE_USER } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { SaveTypeUserOutputInterface } from '@interfaces/output/admin/save-type-user-output-interface'
import { SaveTypeUserResponseInterface } from '@interfaces/response/admin/save-type-user-response-interface'

const BASE_URL_LANGUAGE = i18n.language

async function SaveTypeUserApi(ae_object: SaveTypeUserOutputInterface) {
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
        lng: BASE_URL_LANGUAGE,
      },
      body: JSON.stringify({
        id: ae_object.id ?? 0,
        name: ae_object.name ?? '',
        active: ae_object.active ?? false,
        idModifiedBy: ae_object.idModifiedBy ?? 0,
        idSubsidiary: ae_object.idSubsidiary ?? 0,
        idCompany: ae_object.idCompany ?? 0,
      }),
    }

    const data = await RawFetchData<SaveTypeUserResponseInterface>(BASE_URL_ADMINISTRATION_TYPE_USER, 'save', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<SaveTypeUserResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as SaveTypeUserResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as SaveTypeUserResponseInterface
  }
}

export { SaveTypeUserApi as SaveTypeUser }
