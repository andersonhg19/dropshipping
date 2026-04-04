import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { StoreDTOInterface } from '@interfaces/response/admin/get-all-store-response-interface'

export const storeInfoAtom = atomWithStorage<StoreDTOInterface | null>('storeInfo', null)

//TODO!!: Cargar la información de la tienda desde el servidor
export const storeInfoPosAtom = atom({
  addressPos: process.env.NEXT_PUBLIC_STORE_ADDRESS || '',
  codeMunPos: process.env.NEXT_PUBLIC_STORE_CODE_CITY || '',
  nameMunPos: process.env.NEXT_PUBLIC_STORE_CITY || '',
  codeDepPos: process.env.NEXT_PUBLIC_STORE_CODE_DEPARTMENT || '',
  nameDepPos: process.env.NEXT_PUBLIC_STORE_DEPARTMENT || '',
})
