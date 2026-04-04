import { atomWithStorage } from 'jotai/utils'

interface subsidiaryStorePosProps {
  idSubsidiary: number | null
  storeNumber: string | null
  internalCode: string | null
}

export const pathAtom = atomWithStorage<string | null>('path', null)
export const subsidiaryStorePosAtom = atomWithStorage<subsidiaryStorePosProps | null>('subsidiaryStorePos', null)
