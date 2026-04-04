import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_FILIAL_STYLE } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { ReturnService } from '@api/return-service'

import { GetAllFilialStyleOutputInterface } from '@interfaces/output/admin/get-all-filial-style-output-interface'
import { GetAllFilialStyleResponseInterface } from '@interfaces/response/admin/get-all-filial-style-response-interface'

async function GetAllFilialStyleApi(ae_object: GetAllFilialStyleOutputInterface) {
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
        type: ae_object.type ?? '',
        typeValue: ae_object.typeValue ?? '',
        idModifiedBy: ae_object.idModifiedBy ?? '',
        active: ae_object.active ?? true,
        page: ae_object.page ?? 0,
        size: ae_object.size ?? 100,
      }),
    }

    const data = await RawFetchData<GetAllFilialStyleResponseInterface>(
      BASE_URL_ADMINISTRATION_FILIAL_STYLE,
      'all',
      options
    )

    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllFilialStyleResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllFilialStyleResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllFilialStyleResponseInterface
  }
}

export { GetAllFilialStyleApi }
