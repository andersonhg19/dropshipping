import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_FILIAL } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { SaveFilialOutputInterface } from '@interfaces/output/admin/save-filial-output-interface'
import { SaveFilialResponseInterface } from '@interfaces/response/admin/save-filial-response-interface'

const BASE_URL_LANGUAGE = i18n.language

async function SaveFilialApi(ae_object: SaveFilialOutputInterface) {
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
        id: ae_object.id || '',
        idCompany: ae_object.idCompany || '',
        idModifiedBy: ae_object.idModifiedBy || '',
        name: ae_object.name || '',
        nit: ae_object.nit || '',
        address: ae_object.address || '',
        legalRepresentative: ae_object.legalRepresentative || '',
        phone: ae_object.phone || '',
        email: ae_object.email || '',
        image: ae_object.image || '',
        active: ae_object.active,
      }),
    }

    const data = await RawFetchData<SaveFilialResponseInterface>(BASE_URL_ADMINISTRATION_FILIAL, 'save', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<SaveFilialResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as SaveFilialResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as SaveFilialResponseInterface
  }
}

export { SaveFilialApi }
