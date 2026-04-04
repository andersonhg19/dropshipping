import { BASE_URL_LANGUAGE } from '@utils/constants'
import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_PAGES } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { GetPagesAllOutputInterface } from '@interfaces/output/admin/get-all-page-output-interface'
import { GetAllPagesResponseInterface } from '@interfaces/response/admin/get-all-pages-response-interface'

async function GetAllPagesApi(ae_object: GetPagesAllOutputInterface) {
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
        npage: ae_object.npage ?? '',
        icon: ae_object.icon ?? '',
        name: ae_object.name ?? '',
        idModifiedBy: ae_object.idModifiedBy ?? '',
        idModule: ae_object.idModule ?? '',
        active: ae_object.active ?? null,
        size: ae_object.size ?? 100,
        page: ae_object.page ?? 0,
      }),
    }

    // Llamada a FetchData
    const data = await RawFetchData<GetAllPagesResponseInterface>(BASE_URL_ADMINISTRATION_PAGES, 'all', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllPagesResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllPagesResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllPagesResponseInterface
  }
}

export { GetAllPagesApi }
