import { atomWithStorage } from 'jotai/utils'

import { FilialsDetailsResponse } from '@interfaces/response/admin/get-all-filial-response-interface'

export const subsidiaryAtom = atomWithStorage<FilialsDetailsResponse | null>('subsidiaryDetail', null)
