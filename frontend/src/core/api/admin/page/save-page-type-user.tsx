import { getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_PAGES_TYPE_USER } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { SavePageTypeUserOutputInterface } from '@interfaces/output/admin/save-page-type-user-output-interface'
import { SavePageTypeUserResponseInterface } from '@interfaces/response/admin/save-page-type-user-response-interface'

const BASE_URL_LANGUAGE = i18n.language

async function SavePageTypeUser(ae_object: SavePageTypeUserOutputInterface) {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }

  try {
    const options = {
      method: 'post',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        lng: BASE_URL_LANGUAGE,
      },
      body: JSON.stringify({
        id: ae_object.id,
        idTypeUser: ae_object.idTypeUser,
        idModifiedBy: ae_object.idModifiedBy,
        pages: ae_object.pages.map((page) => ({
          idPage: page.idPage,
          canCreate: page.canCreate,
          canUpdate: page.canUpdate,
          canDelete: page.canDelete,
          canRead: page.canRead,
          active: page.active,
        })),
      }),
    }

    const data = await RawFetchData<SavePageTypeUserResponseInterface>(
      BASE_URL_ADMINISTRATION_PAGES_TYPE_USER,
      'save',
      options
    )

    return data
  } catch (err) {
    const http = err as RawHttpError<SavePageTypeUserResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as SavePageTypeUserResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as SavePageTypeUserResponseInterface
  }
}

export { SavePageTypeUser }
