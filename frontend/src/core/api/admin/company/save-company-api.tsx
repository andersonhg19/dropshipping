import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_COMPANY } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { SaveCompanyOutputInterface } from '@interfaces/output/admin/save-company-output-interface'
import { SaveCompanyResponseInterface } from '@interfaces/response/admin/save-company-response-interface'

const BASE_URL_LANGUAGE = i18n.language

async function SaveCompanyApi(ae_object: SaveCompanyOutputInterface) {
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
        name: ae_object.name || '',
        nit: ae_object.nit || '',
        address: ae_object.address || '',
        legalRepresentative: ae_object.legalRepresentative || '',
        contactPerson: ae_object.contactPerson || '',
        phone: ae_object.phone || '',
        email: ae_object.email || '',
        active: ae_object.active,
        idModifiedBy: ae_object.idModifiedBy || '',
      }),
    }

    const data = await RawFetchData<SaveCompanyResponseInterface>(BASE_URL_ADMINISTRATION_COMPANY, 'save', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<SaveCompanyResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as SaveCompanyResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as SaveCompanyResponseInterface
  }
}

export { SaveCompanyApi }
