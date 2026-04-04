// src/core/api/admin/user/get-all-users-api.ts
import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_USER } from '@api/api-path'
import { RawFetchData, type RawHttpError } from '@api/raw-fetch-data'

import type { GetUsersAllOutputInterface } from '@interfaces/output/admin/get-all-users-output-interface'
import type { GetAllUsersResponseInterface } from '@interfaces/response/admin/get-all-users-response-interface'

async function GetAllUsersApi(params: GetUsersAllOutputInterface): Promise<GetAllUsersResponseInterface> {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }
  try {
    const options: RequestInit = {
      method: 'POST',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        lng: i18n.language, // ✅ no usar constantes aquí
      },
      body: JSON.stringify({
        id: params.id ?? '',
        idCompany: params.idCompany ?? '',
        idSubsidiary: params.idSubsidiary ?? null,
        idModifiedBy: params.idModifiedBy ?? null,
        idTypeUser: params.idTypeUser ?? null,
        name: params.name ?? '',
        lastName: params.lastName ?? '',
        mail: params.email ?? '', // <- mapeo explícito
        dni: params.dni ?? '',
        cellphone: params.cellphone ?? '',
        active: params.active ?? null,
        size: params.size ?? 10,
        page: params.page ?? 0,
      }),
    }

    const data = await RawFetchData<GetAllUsersResponseInterface>(BASE_URL_ADMINISTRATION_USER, 'all', options)

    // ✅ devolvemos el envelope tal cual
    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllUsersResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllUsersResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllUsersResponseInterface
  }
}

export { GetAllUsersApi }
