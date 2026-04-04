import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_FILIAL } from '@api/api-path'
import { RawFetchData, type RawHttpError } from '@api/raw-fetch-data'

import type { GetAllFilialOutputInterface } from '@interfaces/output/admin/get-all-filial-output-interface'
import type { GetAllFilialResponseInterface } from '@interfaces/response/admin/get-all-filial-response-interface'

async function GetAllFilialApi(params: GetAllFilialOutputInterface): Promise<GetAllFilialResponseInterface> {
  const token = getKeyApi()
  if (token === '') {
    return {
      correct: false,
      message: i18n.t('errorTokenAPI') as string,
      errorCode: 102,
      object: null,
    } as unknown as GetAllFilialResponseInterface
  }
  try {
    const options: RequestInit = {
      method: 'POST',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: params.id ?? '',
        name: params.name ?? '',
        nit: params.nit ?? '',
        idCompany: params.idCompany ? String(params.idCompany) : '',
        state: params.state ?? true,
        page: params.page ?? 0,
        size: params.size ?? 100,
      }),
    }

    const data = await RawFetchData<GetAllFilialResponseInterface>(BASE_URL_ADMINISTRATION_FILIAL, 'all', options)
    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllFilialResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllFilialResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllFilialResponseInterface
  }
}

export { GetAllFilialApi }
