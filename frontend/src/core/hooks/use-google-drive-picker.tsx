/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ''
const GOOGLE_APP_ID = process.env.NEXT_PUBLIC_GOOGLE_APP_ID ?? ''

const SCOPES = 'https://www.googleapis.com/auth/drive.file'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

/** Load a script tag and resolve when it's ready */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export interface UseGoogleDrivePickerReturn {
  /** Whether the Google APIs are ready */
  ready: boolean
  /** Whether OAuth token is available */
  authenticated: boolean
  /** Trigger OAuth sign-in */
  signIn: () => Promise<void>
  /** Open picker to upload a file and return its public URL */
  uploadAndGetUrl: () => Promise<string | null>
  /** Loading state */
  loading: boolean
  /** Any error message */
  error: string | null
}

export function useGoogleDrivePicker(): UseGoogleDrivePickerReturn {
  const [ready, setReady] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenClientRef = useRef<google.accounts.oauth2.TokenClient | null>(null)
  const accessTokenRef = useRef<string | null>(null)

  // Load gapi + gis scripts
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      setError('Google Drive credentials not configured')
      return
    }

    let cancelled = false

    const init = async () => {
      try {
        await Promise.all([
          loadScript('https://apis.google.com/js/api.js'),
          loadScript('https://accounts.google.com/gsi/client'),
        ])

        // Init gapi client
        await new Promise<void>((resolve) => gapi.load('client:picker', resolve))
        await gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        })

        if (cancelled) return

        // Init GIS token client
        tokenClientRef.current = google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse.access_token) {
              accessTokenRef.current = tokenResponse.access_token
              setAuthenticated(true)
            }
          },
        })

        setReady(true)
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Error loading Google APIs')
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  const signIn = useCallback(async () => {
    if (!tokenClientRef.current) return
    tokenClientRef.current.requestAccessToken({ prompt: 'consent' })
  }, [])

  const uploadAndGetUrl = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!ready) {
        setError('Google APIs not ready')
        resolve(null)
        return
      }

      const token = accessTokenRef.current
      if (!token) {
        // Need to authenticate first; trigger sign-in flow and then open picker
        if (!tokenClientRef.current) {
          resolve(null)
          return
        }

        // Override the callback to chain into picker after auth
        const originalCallback = tokenClientRef.current.callback
        tokenClientRef.current.callback = (tokenResponse: google.accounts.oauth2.TokenResponse) => {
          if (tokenResponse.access_token) {
            accessTokenRef.current = tokenResponse.access_token
            setAuthenticated(true)
            openPicker(tokenResponse.access_token, resolve)
          } else {
            resolve(null)
          }
          // Restore original callback
          if (tokenClientRef.current) {
            tokenClientRef.current.callback = originalCallback
          }
        }
        tokenClientRef.current.requestAccessToken({ prompt: '' })
        return
      }

      openPicker(token, resolve)
    })
  }, [ready])

  const openPicker = (token: string, resolve: (url: string | null) => void) => {
    setLoading(true)
    setError(null)

    const uploadView = new google.picker.DocsUploadView()
    const docsView = new google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(false)

    const picker = new google.picker.PickerBuilder()
      .addView(uploadView)
      .addView(docsView)
      .setOAuthToken(token)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setAppId(GOOGLE_APP_ID)
      .setCallback(async (data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.PICKED) {
          const doc = data.docs?.[0]
          if (doc?.id) {
            try {
              // Make the file accessible via link
              await gapi.client.drive.permissions.create({
                fileId: doc.id,
                resource: {
                  role: 'reader',
                  type: 'anyone',
                },
              } as any)

              const url = `https://drive.google.com/file/d/${doc.id}/view`
              setLoading(false)
              resolve(url)
            } catch (err: any) {
              setError(err?.message ?? 'Error sharing file')
              setLoading(false)
              resolve(null)
            }
          } else {
            setLoading(false)
            resolve(null)
          }
        } else if (data.action === google.picker.Action.CANCEL) {
          setLoading(false)
          resolve(null)
        }
      })
      .build()

    picker.setVisible(true)
  }

  return { ready, authenticated, signIn, uploadAndGetUrl, loading, error }
}
