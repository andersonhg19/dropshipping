import { BASE_URL_AUTHENTICATION } from '@api/api-path'
import { RawFetchData } from '@api/raw-fetch-data'

interface AuthResponse {
  token: string
  username: string
}

async function auth(ae_user: string, ae_password: string): Promise<string> {
  const options: RequestInit = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: ae_user,
      password: ae_password,
    }),
  }

  const data = await RawFetchData<AuthResponse>(BASE_URL_AUTHENTICATION, 'login', options)

  if (data.token) {
    return data.token ?? 'error en la autenticación, token nulo'
  } else {
    console.error('Error en la autenticación:')
    return 'error en la autenticación '
  }
}

export { auth }
