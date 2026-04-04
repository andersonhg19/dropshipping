import { atom } from 'jotai'

import { UserResponseInterface } from '@interfaces/response/admin/login-user-response-interface'

const UserAtom = atom<UserResponseInterface | null>(null)

export default UserAtom
