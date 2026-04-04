import { useCallback } from 'react'

type ApiResponseBase = { correct?: boolean; message?: string; errorCode?: number }

export function useFetchData<T, R extends ApiResponseBase>(
  initialData: T,
  setData: (data: R) => void,
  entityName: string,
  fetchFunction: (params: T) => Promise<R>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) {
  const fetchData = useCallback(
    async (override?: Partial<T>) => {
      setLoading(true)
      setError(null)

      const payload = { ...initialData, ...(override ?? {}) } as T

      try {
        // ÚTIL para depurar
        // eslint-disable-next-line no-console
        // console.debug(`[${entityName}] payload:`, payload)

        const response = await fetchFunction(payload)

        if (response?.correct) {
          setData(response)
        } else {
          const msg = response?.message || 'Unknown error'
          setError(msg)
          // eslint-disable-next-line no-console
          console.error(`Error fetching ${entityName}:`, response)
        }

        return response
      } catch (err: any) {
        const msg = err?.message ?? String(err)
        setError(`Error fetching ${entityName}: ${msg}`)
        // eslint-disable-next-line no-console
        console.error(`Error fetching ${entityName}:`, err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [initialData, setData, entityName, fetchFunction, setLoading, setError]
  )

  return { fetchData }
}
