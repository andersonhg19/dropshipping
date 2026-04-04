import { BASE_URL_LANGUAGE } from '@utils/constants'
import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_PAGES_TYPE_USER } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { GetPagesTypeUserAllOutputInterface } from '@interfaces/output/admin/get-all-page-type-user-output-interface'
import { GetAllPagesTypeUserResponseInterface } from '@interfaces/response/admin/get-all-pages-type-user-response-interface'

export async function GetPagesTypeUser(ae_object: GetPagesTypeUserAllOutputInterface) {
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
        id: ae_object.id ?? '',
        idPage: ae_object.idPage ?? '',
        idTypeUser: ae_object.idTypeUser ?? '',
        idModifiedBy: ae_object.idModifiedBy ?? '',
        canCreate: ae_object.canCreate ?? null,
        canUpdate: ae_object.canUpdate ?? null,
        canDelete: ae_object.canDelete ?? null,
        canRead: ae_object.canRead ?? null,
        active: ae_object.active ?? null,
        size: ae_object.size ?? 100,
        page: ae_object.page ?? 0,
      }),
    }

    const data = await RawFetchData<GetAllPagesTypeUserResponseInterface>(
      BASE_URL_ADMINISTRATION_PAGES_TYPE_USER,
      'all',
      options
    )

    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllPagesTypeUserResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllPagesTypeUserResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllPagesTypeUserResponseInterface
  }
}
