'use client'

import { encryptedCacheAtom } from '@states/encrypted-cache'
import { useAtomValue, useSetAtom } from 'jotai'

import { decryptJSON, encryptJSON } from '@utils/crypto'

export function useEncryptedCache() {
  const cache = useAtomValue(encryptedCacheAtom)
  const setCache = useSetAtom(encryptedCacheAtom)

  function set<T>(key: string, data: T) {
    const cipher = encryptJSON<T>(data)
    setCache((prev) => ({ ...prev, [key]: cipher }))
  }

  function get<T = unknown>(key: string): T | null {
    const cipher = cache[key]
    if (!cipher) return null
    try {
      return decryptJSON<T>(cipher)
    } catch {
      return null
    }
  }

  return { set, get }
}
