import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_FILIAL_STYLE } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { SaveFilialStyleOutputInterface } from '@interfaces/output/admin/save-filial-style-output-interface'
import { SaveFilialStyleResponseInterface } from '@interfaces/response/admin/save-filial-style-response-interface'

async function SaveFilialStyleApi(ae_object: SaveFilialStyleOutputInterface) {
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
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: ae_object.id ?? '',
        idSubsidiary: ae_object.idSubsidiary ?? 0,
        idCompany: ae_object.idCompany ?? '',
        idModifiedBy: ae_object.idModifiedBy ?? '',
        details: ae_object.details.map((detail) => ({
          id: detail.id ?? '',
          name: detail.name ?? '',
          value: detail.value ?? '',
          type: detail.type ?? '',
          typeValue: detail.typeValue ?? '',
          active: detail.active ?? false,
        })),
      }),
    }

    const data = await RawFetchData<SaveFilialStyleResponseInterface>(
      BASE_URL_ADMINISTRATION_FILIAL_STYLE,
      'save',
      options
    )

    return data
  } catch (err) {
    const http = err as RawHttpError<SaveFilialStyleResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as SaveFilialStyleResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as SaveFilialStyleResponseInterface
  }
}

export { SaveFilialStyleApi }
