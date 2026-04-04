import { atomWithStorage } from 'jotai/utils'

import { LoginResponse } from '@interfaces/response/auth/login-response-interface'

const AdminAtom = atomWithStorage<LoginResponse | null>('admin', null)

export default AdminAtom
