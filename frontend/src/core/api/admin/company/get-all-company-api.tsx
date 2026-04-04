import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_COMPANY } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'
import { ReturnService } from '@api/return-service'

import { GetAllCompanyOutputInterface } from '@interfaces/output/admin/get-all-company-output-interface'
import { GetAllCompanyResponseInterface } from '@interfaces/response/admin/get-all-company-response-interface'

async function GetAllCompany(ae_object: GetAllCompanyOutputInterface): Promise<GetAllCompanyResponseInterface> {
  try {
    const token = await getKeyApi()
    if (!token) {
      return new ReturnService(
        '',
        false,
        i18n.t('errorTokenAPI') as string,
        102
      ) as unknown as GetAllCompanyResponseInterface
    }

    const options: RequestInit = {
      method: 'POST',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        lng: i18n.language,
      },
      body: JSON.stringify({
        id: ae_object.id ?? '',
        name: ae_object.name ?? '',
        nit: ae_object.nit ?? '',
        active: ae_object.active ?? true,
        page: ae_object.page ?? 0,
        size: ae_object.size ?? 100,
      }),
    }

    const data = await RawFetchData<GetAllCompanyResponseInterface>(BASE_URL_ADMINISTRATION_COMPANY, 'all', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<GetAllCompanyResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as GetAllCompanyResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as GetAllCompanyResponseInterface
  }
}

export { GetAllCompany }
