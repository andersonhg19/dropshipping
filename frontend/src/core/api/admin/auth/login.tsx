import { deleteKeyApi, deleteUser, encrypt, setKeyApi, setUser } from '@utils/utilities'

import i18n from '@config/language/i18n'

import { BASE_URL_ADMINISTRATION_USER } from '@api/api-path'

/** Traduce mensajes del backend que vienen como <clave_traduccion> */
function translateBackendMessage(raw: string | undefined): string {
  if (!raw || typeof raw !== 'string') return raw ?? ''
  const keyMatch = raw.match(/^<(.+?)>$/)
  const i18nKey = keyMatch ? keyMatch[1] : raw
  return i18n.t(i18nKey, { defaultValue: raw })
}

import { GetToken } from '@api/auth/get-token'
import { RawFetchData, RawHttpError } from '@api/raw-fetch-data'

import { LoginUserResponseInterface } from '@interfaces/response/admin/login-user-response-interface'

async function Login(ae_user: string, ae_password: string): Promise<LoginUserResponseInterface> {
  try {
    const token = await GetToken()

    if (!token) {
      return {
        correct: false,
        message: i18n.t('errorTokenAPI'),
        errorCode: 102,
        object: null,
      }
    }

    ae_password = encrypt(ae_password)

    const options: RequestInit = {
      method: 'post',
      mode: 'cors' as RequestMode,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        lng: i18n.language,
      },
      body: JSON.stringify({
        email: ae_user,
        password: ae_password,
      }),
    }

    const data = await RawFetchData<LoginUserResponseInterface>(BASE_URL_ADMINISTRATION_USER, 'login', options)

    if (data.correct) {
      setKeyApi(token)
      setUser(data.object)
      return data
    } else {
      deleteKeyApi()
      deleteUser()
      const rawMsg = data.message || i18n.t('msj_Incorrect_credentials_try_again')
      return {
        correct: false,
        message: translateBackendMessage(rawMsg),
        errorCode: data.errorCode,
        object: null,
      }
    }
  } catch (error: any) {
    deleteKeyApi()
    deleteUser()
    let errorMessage = i18n.t('lbl_error_unexpected')
    let errorCode = 500

    // Si es error HTTP (4xx/5xx), el mensaje del backend puede estar en payload
    const httpErr = error as RawHttpError<{ message?: string; msg?: string; error?: string }>
    const payload = httpErr?.payload
    const backendMsg =
      payload && typeof payload === 'object'
        ? (payload as any).message ?? (payload as any).msg ?? (payload as any).error
        : null

    if (backendMsg) {
      errorMessage = translateBackendMessage(backendMsg)
      errorCode = httpErr?.status ?? 500
    } else if (error?.status === 408 || error?.message?.includes('timeout')) {
      errorMessage = 'El servidor no respondió a tiempo. Por favor, intenta nuevamente.'
      errorCode = 408
    } else if (error?.status === 0 || error?.message?.includes('red') || error?.message?.includes('conectar')) {
      errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté disponible.'
      errorCode = 503
    } else if (error?.status) {
      errorMessage = translateBackendMessage(error?.message) || i18n.t('lbl_error_unexpected')
      errorCode = error.status
    } else if (error?.message) {
      errorMessage = translateBackendMessage(error.message)
    }

    console.error('Error en login:', error)
    return {
      correct: false,
      message: errorMessage,
      errorCode,
      object: null,
    }
  }
}

export { Login }
