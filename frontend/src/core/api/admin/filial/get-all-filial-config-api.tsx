import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_FILIAL_CONFIG } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { ReturnService } from '@api/return-service'

import { GetAllFilialConfigOutputInterface } from '@interfaces/output/admin/get-all-filial-config-output-interface'
import { GetAllFilialConfigResponseInterface } from '@interfaces/response/admin/get-all-filial-config-response-interface'

async function GetAllFilialConfigApi(ae_object: GetAllFilialConfigOutputInterface) {
  const token = getKeyApi()
  if (token === '') {
    return new ReturnService('', false, i18n.t('errorTokenAPI'), 102)
  }

  try {
    const options: RequestInit = {
      method: 'post',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: ae_object.id ?? '',
        idSubsidiary: ae_object.idSubsidiary ?? 0,
        idCompany: ae_object.idCompany ?? '',
        name: ae_object.name ?? '',
        value: ae_object.value ?? '',
        idUser: ae_object.idUser ?? '',
        active: ae_object.active ?? null,
        page: ae_object.page ?? 0,
        size: ae_object.size ?? 100,
      }),
    }

    const data = await RawFetchData<GetAllFilialConfigResponseInterface>(
      BASE_URL_ADMINISTRATION_FILIAL_CONFIG,
      'all',
      options
    )
    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllFilialConfigResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllFilialConfigResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllFilialConfigResponseInterface
  }
}

export { GetAllFilialConfigApi }
