'use client'

import { atom } from 'jotai'

export type EncryptedCache = Record<string, string>
export const encryptedCacheAtom = atom<EncryptedCache>({})
