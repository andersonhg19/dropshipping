'use client'

import CryptoJS from 'crypto-js'

import { env } from '../../../env.mjs'

let sessionKey: string | null = null

function ensureKey(): string {
  // Si pusiste NEXT_PUBLIC_CACHE_SECRET, úsala; si no, generamos una por sesión
  if (env.NEXT_PUBLIC_CACHE_SECRET) return env.NEXT_PUBLIC_CACHE_SECRET
  if (!sessionKey) sessionKey = CryptoJS.lib.WordArray.random(32).toString()
  return sessionKey
}

export function encryptJSON<T>(data: T, key?: string): string {
  const k = key ?? ensureKey()
  const plaintext = JSON.stringify(data)
  return CryptoJS.AES.encrypt(plaintext, k).toString()
}

export function decryptJSON<T = unknown>(ciphertext: string, key?: string): T {
  const k = key ?? ensureKey()
  const bytes = CryptoJS.AES.decrypt(ciphertext, k)
  const plaintext = bytes.toString(CryptoJS.enc.Utf8)
  return JSON.parse(plaintext) as T
}
