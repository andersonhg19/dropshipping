import { BASE_URL_LANGUAGE } from '@utils/constants'
import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_MODULE } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { GetAllModuleOutputInterface } from '@interfaces/output/admin/get-all-module-output-interface'
import { GetAllModuleResponseInterface } from '@interfaces/response/admin/get-all-module-response-interface'

async function GetAllModuleApi(ae_object: GetAllModuleOutputInterface) {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }

  console.log('GetAllModuleApi called with:', ae_object)

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
        name: ae_object.name ?? '',
        idModifiedBy: ae_object.idModifiedBy ?? '',
        active: ae_object.active ?? null,
        size: ae_object.size ?? 20,
        page: ae_object.page ?? 0,
      }),
    }

    // Llamada a FetchData
    const data = await RawFetchData<GetAllModuleResponseInterface>(BASE_URL_ADMINISTRATION_MODULE, 'all', options)

    const side = typeof window === 'undefined' ? 'SERVER' : 'CLIENT'
    console.log(`[${side}] GetAllModuleApi response:`, data)

    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllModuleResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllModuleResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllModuleResponseInterface
  }
}

export { GetAllModuleApi }
