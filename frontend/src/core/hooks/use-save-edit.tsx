import { useCallback } from 'react'

export function useSaveEdit<T, R>(
  saveFunction: (params: T) => Promise<R>,
  setData: (data: R) => void,
  entityName: string,
  setLoading: (loading: boolean) => void,
  onError: (error: string) => void,
  t: any,
  editingEntity: T | null
) {
  const handleSaveEdit = useCallback(async () => {
    try {
      if (!editingEntity || (editingEntity as any).name?.trim() === '') {
        onError(t('requiredField'))
        return
      }
      setLoading(true)

      const response = await saveFunction(editingEntity)

      if (response) {
        // Verificar si la respuesta tiene un campo 'correct' (respuesta de API estándar)
        if ((response as any).correct === false) {
          const errorMessage = (response as any).message || `Error al guardar ${entityName}`
          onError(errorMessage)
          return
        }
        setData(response)
      } else {
        throw new Error(`Invalid response structure from ${entityName} fetch`)
      }
    } catch (error) {
      console.error(`Error saving ${entityName}:`, error)
      onError(`Error saving ${entityName}: ${error}`)
    } finally {
      setLoading(false)
    }
  }, [editingEntity, saveFunction, setData, setLoading, onError, entityName, t])

  return { editingEntity, handleSaveEdit }
}
