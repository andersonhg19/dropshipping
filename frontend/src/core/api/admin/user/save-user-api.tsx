import { encrypt, getKeyApi } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_USER } from '@api/api-path'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { SaveUserOutputInterface } from '@interfaces/output/admin/save-user-output-interface'
import { SaveUserResponseInterface } from '@interfaces/response/admin/save-user-response-interface'

const BASE_URL_LANGUAGE = i18n.language

async function SaveUserApi(ae_object: SaveUserOutputInterface) {
  const token = getKeyApi()
  if (token === '') {
    return { correct: false, message: i18n.t('errorTokenAPI') as string, errorCode: 102, object: null }
  }

  // Sanitizar password sin usar trim() si no es string
  const rawPwd = typeof ae_object.password === 'string' ? ae_object.password : ''
  const hasPwd = rawPwd ? rawPwd.toString().trim().length > 0 : false

  const baseBody: any = {
    id: ae_object.id ?? 0,
    idSubsidiary: ae_object.idSubsidiary ?? 0,
    idCompany: ae_object.idCompany ?? 0,
    name: ae_object.name ?? '',
    lastName: ae_object.lastName ?? '',
    dni: ae_object.dni ?? '',
    email: ae_object.email ?? '',
    cellphone: ae_object.cellphone ?? '',
    idTypeUser: ae_object.idTypeUser ?? '',
    idModifiedBy: ae_object.idModifiedBy ?? 0,
    active: ae_object.active,
    admin: ae_object.admin,
  }

  if (hasPwd) {
    baseBody.password = encrypt(rawPwd) // cifra aquí
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
      body: JSON.stringify(baseBody),
    }

    const data = await RawFetchData<SaveUserResponseInterface>(BASE_URL_ADMINISTRATION_USER, 'save', options)

    return data
  } catch (err) {
    const http = err as RawHttpError<SaveUserResponseInterface | undefined>
    if (typeof http?.status === 'number') {
      if (http.payload && typeof http.payload === 'object') return http.payload
      return {
        correct: false,
        message: i18n.t('lbl_error_unexpected') as string,
        errorCode: http.status,
        object: null,
      } as unknown as SaveUserResponseInterface
    }
    return {
      correct: false,
      message: i18n.t('lbl_error_unexpected') as string,
      errorCode: 500,
      object: null,
    } as unknown as SaveUserResponseInterface
  }
}

export { SaveUserApi }
