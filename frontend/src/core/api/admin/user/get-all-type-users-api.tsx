import { BASE_URL_LANGUAGE } from '@utils/constants'
import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_TYPE_USER } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { GetAllTypeUserOutputInterface } from '@interfaces/output/admin/get-all-type-user-output-interface'
import { GetAllTypeUserResponseInterface } from '@interfaces/response/admin/get-all-type-user-response-interface'

export async function GetAllTypeUsersApi(ae_object: GetAllTypeUserOutputInterface) {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }

  try {
    const options: RequestInit = {
      method: 'post',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        lng: BASE_URL_LANGUAGE,
      },
      body: JSON.stringify({
        id: ae_object.id ?? null,
        name: ae_object.name ?? '',
        idCompany: ae_object.idCompany ?? null,
        idSubsidiary: ae_object.idSubsidiary ?? null,
        active: ae_object.active ?? true,
        size: ae_object.size,
        page: ae_object.page,
      }),
    }

    const data = await RawFetchData<GetAllTypeUserResponseInterface>(BASE_URL_ADMINISTRATION_TYPE_USER, 'all', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllTypeUserResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllTypeUserResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllTypeUserResponseInterface
  }
}
