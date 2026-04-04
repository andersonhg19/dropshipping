declare global {
  interface Window {
    __ENV__?: {
      API_URL?: string
      IMG_BOPOS_URL?: string
    }
  }
}

export function getApiUrl(): string {
  // 1) Client override
  if (typeof window !== 'undefined' && window.__ENV__?.API_URL) {
    return window.__ENV__?.API_URL
  }

  // 2) Env pública de Next.js
  const env = process.env.NEXT_PUBLIC_API_URL
  if (env) return env

  throw new Error('[env] NEXT_PUBLIC_API_URL no definida. Añádela en .env.local o inyecta window.__ENV__.API_URL')
}

export function getImgBoposUrl(): string {
  if (typeof window !== 'undefined' && window.__ENV__?.IMG_BOPOS_URL) {
    return window.__ENV__!.IMG_BOPOS_URL!
  }

  if (process.env.NEXT_PUBLIC_IMG_BOPOS_URL) {
    return process.env.NEXT_PUBLIC_IMG_BOPOS_URL
  }
  throw new Error('[env] NEXT_PUBLIC_IMG_BOPOS_URL no definida')
}
