import crypto from 'crypto'

import { INFINITY_SYMBOL, NOT_AVAILABLE } from '@utils/constants'

/* ──────────────────────────────────────────────────────────────────────────
 * 1) CONFIG & CONSTANTES
 * ────────────────────────────────────────────────────────────────────────── */
const ENV_PASSWORD: string = process.env.REACT_APP_API_KEY || ''

const START_TAG = '420'
const END_TAG = '021'

// Keys lógicas para localStorage (algunas con “fecha-prefijo”)
const KEY_API_STORE = '3a1f8a790c238b8df0d447b53d792134'
const KEY_USER = '2a5f8a790c238u8sf0e447r53d344378'
const PRIVS_KEY = '__user_privileges__' // <- privilegios sin fecha-prefijo

/* ──────────────────────────────────────────────────────────────────────────
 * 2) HELPERS GENERALES (fecha para prefijar storage)
 * ────────────────────────────────────────────────────────────────────────── */
function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function todayKey(): string {
  const d = new Date()
  const dd = d.getDate()
  const mm = d.getMonth() + 1
  const yyyy = d.getFullYear()
  // sin padding para mantener compatibilidad con tu implementación actual
  return `${dd}${mm}${yyyy}`
}

function withDatePrefix(key: string): string {
  return `${todayKey()}${key}`
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3) LOCALSTORAGE SAFE
 * ────────────────────────────────────────────────────────────────────────── */
function setKeyStore(key: string, data: string): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(withDatePrefix(key), data)
  } catch (error) {
    console.error('Error setting key store', error)
  }
}

function getKeyStore(key: string): string | null {
  if (!isBrowser()) return null
  try {
    return localStorage.getItem(withDatePrefix(key))
  } catch (error) {
    console.error('Error getting key store', error)
    return null
  }
}

function deleteKeyStore(key: string): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(withDatePrefix(key))
  } catch (error) {
    console.error('Error deleting key store', error)
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4) CRYPTO (AES-256-CBC)
 *   - encryptObject/decryptObject usan las APIs legacy (createCipher/createDecipher)
 *     por compatibilidad. Considera migrarlas a IV explícito si no necesitas
 *     leer datos antiguos.
 *   - encrypt(data) ya usa createCipheriv con IV.
 * ────────────────────────────────────────────────────────────────────────── */
const LEGACY_ALGO = 'aes-256-cbc'

/** Cifra un objeto (LEGACY: usa createCipher + secret). */
function encryptObject(object: any): string {
  if (object == null) return ''
  const jsonString = JSON.stringify(object)
  // ⚠️ API DEPRECATED. Mantengo por compatibilidad.
  const cipher = crypto.createCipher(LEGACY_ALGO, ENV_PASSWORD as any)
  let out = cipher.update(jsonString, 'utf-8', 'hex')
  out += cipher.final('hex')
  return out
}

/** Descifra un objeto cifrado por encryptObject (LEGACY). */
function decryptObject(encryptedString: string | null): any {
  if (!encryptedString) return ''
  // ⚠️ API DEPRECATED. Mantengo por compatibilidad.
  const decipher = crypto.createDecipher(LEGACY_ALGO, ENV_PASSWORD as any)
  let decrypted = decipher.update(encryptedString, 'hex', 'utf-8')
  decrypted += decipher.final('utf-8')
  return JSON.parse(decrypted)
}

/**
 * Cifra un texto con IV explícito.
 * ENV_PASSWORD debe contener una clave en hex cuyo “núcleo” (slice(4,-4)) tenga 32 bytes (64 hex).
 */
function encrypt(data: string | null): string {
  try {
    if (data === null) return ''

    const passwordCore = ENV_PASSWORD.slice(4).slice(0, -4)
    const iv = crypto.randomBytes(16)
    const key = Buffer.from(passwordCore, 'hex')
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)

    let encrypted = cipher.update(data, 'utf-8', 'hex')
    encrypted += cipher.final('hex')

    return `${encrypted}.${iv.toString('hex')}`
  } catch (e) {
    console.error('Error encriptando: ', e)
    return ''
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * 5) API KEY & USER STORAGE (con fecha-prefijo)
 * ────────────────────────────────────────────────────────────────────────── */
function setKeyApi(data: string): void {
  setKeyStore(KEY_API_STORE, data)
}
function getKeyApi(): string | null {
  return getKeyStore(KEY_API_STORE)
}
function deleteKeyApi(): void {
  deleteKeyStore(KEY_API_STORE)
}

// User cifrado con LEGACY (para no romper datos ya guardados)
function setUser(data: any): void {
  setKeyStore(KEY_USER, encryptObject(data))
}
function getUser(): any {
  if (!isBrowser()) return null
  return decryptObject(getKeyStore(KEY_USER))
}
function deleteUser(): void {
  deleteKeyStore(KEY_USER)
}

type UserCompanyContext = {
  companyId: string
  subsidiaryId: string
}

const coerceIdToString = (value: unknown): string => {
  if (value === null || value === undefined) return ''

  const numeric = Number(value)

  if (!Number.isNaN(numeric) && numeric > 0) {
    return String(numeric)
  }

  return ''
}

function getUserCompanyContext(): UserCompanyContext {
  const user = getUser() as any

  const companyId = coerceIdToString(
    user?.companyId ??
      user?.idCompany ??
      user?.company?.id ??
      user?.company?.idCompany ??
      user?.idEmpresa ??
      user?.empresaId
  )
  const subsidiaryId = coerceIdToString(
    user?.subsidiaryId ??
      user?.idSubsidiary ??
      user?.subsidiary?.id ??
      user?.subsidiary?.idSubsidiary ??
      user?.idFilial ??
      user?.filialId ??
      user?.filial?.id ??
      user?.filial?.idFilial
  )

  return { companyId, subsidiaryId }
}

/* ──────────────────────────────────────────────────────────────────────────
 * 6) PRIVILEGIOS (sin fecha-prefijo)
 * ────────────────────────────────────────────────────────────────────────── */
type Privilege = {
  npage: string
  pageName?: string
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  active: boolean
  id?: number
  idPage?: number
  idTypeUser?: number
  typeUserName?: string
}

const normalizeKey = (s?: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, '-').replace(/_+/g, '-')

function setUserPrivileges(list: Privilege[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(PRIVS_KEY, JSON.stringify(list ?? []))
  } catch {
    /* ignore */
  }
}

function getUserPrivileges(): Privilege[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(PRIVS_KEY)
    return raw ? (JSON.parse(raw) as Privilege[]) : []
  } catch {
    return []
  }
}

function deleteUserPrivileges(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(PRIVS_KEY) // << CORREGIDO (antes borraba otra key)
  } catch {
    /* ignore localStorage errors */
  }
}

function findPriv(npageKey: string): Privilege | undefined {
  const key = normalizeKey(npageKey)
  return getUserPrivileges().find((p) => normalizeKey(p.npage) === key)
}

function pageReadAllowed(npageKey: string): boolean {
  const p = findPriv(npageKey)
  return !!(p && p.active && p.canRead)
}
function pageCreateAllowed(npageKey: string): boolean {
  const p = findPriv(npageKey)
  return !!(p && p.active && p.canCreate)
}
function pageUpdateAllowed(npageKey: string): boolean {
  const p = findPriv(npageKey)
  return !!(p && p.active && p.canUpdate)
}
function pageDeleteAllowed(npageKey: string): boolean {
  const p = findPriv(npageKey)
  return !!(p && p.active && p.canDelete)
}

/* ──────────────────────────────────────────────────────────────────────────
 * 7) PEQUEÑOS HELPERS (UI / FORMATEO)
 * ────────────────────────────────────────────────────────────────────────── */
function setInitEndString(data: string): string {
  return START_TAG + data + END_TAG
}

function getPercentageChange(currentValue: number, lastValue: number): string | number {
  return lastValue === 0 && currentValue !== 0
    ? INFINITY_SYMBOL
    : lastValue === 0 && currentValue === 0
      ? NOT_AVAILABLE
      : parseFloat((((currentValue - lastValue) / lastValue) * 100).toFixed(2))
}

/** Permite letras y espacios. */
function handleNameInput(event: React.ChangeEvent<HTMLInputElement>): void {
  event.target.value = event.target.value.replace(/[^a-zA-Z\s]/g, '')
}

/** Solo dígitos (opcional: acepta coma o punto si lo necesitas). */
function handleNumericInput(event: React.ChangeEvent<HTMLInputElement>, allowDecimal = false): void {
  const re = allowDecimal ? /[^\d.,]/g : /[^\d]/g
  event.target.value = event.target.value.replace(re, '')
}

/** DEPRECADO: mantenido por compatibilidad; usa handleNumericInput. */
function handleNonNumericInput(event: React.ChangeEvent<HTMLInputElement>): void {
  // Antes filtraba letras (estaba invertido). Lo corrijo a numérico:
  handleNumericInput(event, false)
}

function truncateText(text: string, length: number): string {
  return text?.length > length ? `${text.substring(0, length)}...` : text
}

function renderName(selectedItems: { name: string }[]): string {
  if (!selectedItems?.length) return ''
  return selectedItems
    .map((i) => i?.name)
    .filter(Boolean)
    .join(', ')
}

/* ──────────────────────────────────────────────────────────────────────────
 * 8) EXPORTS
 * ────────────────────────────────────────────────────────────────────────── */
export {
  // Crypto
  encrypt,
  encryptObject, // LEGACY
  decryptObject, // LEGACY

  // Storage helpers con fecha
  setKeyStore,
  getKeyStore,
  deleteKeyStore,

  // API key
  setKeyApi,
  getKeyApi,
  deleteKeyApi,

  // User
  getUserCompanyContext,
  setUser,
  getUser,
  deleteUser,

  // Privilegios
  setUserPrivileges,
  getUserPrivileges,
  deleteUserPrivileges,
  pageReadAllowed,
  pageCreateAllowed,
  pageUpdateAllowed,
  pageDeleteAllowed,
  normalizeKey,

  // Otros helpers
  setInitEndString,
  getPercentageChange,
  handleNameInput,
  handleNumericInput,
  handleNonNumericInput, // deprecado
  truncateText,
  renderName,
}

export type { Privilege }
