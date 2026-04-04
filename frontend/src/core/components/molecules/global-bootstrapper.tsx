'use client'

import { useEffect } from 'react'

import { env } from 'env.mjs'

import { useEncryptedCache } from '@hooks/use-encrypted-cache'

import { GetAllFilialApi } from '@api/admin/filial/get-all-filial-api'

import type { GetAllFilialResponseInterface } from '@interfaces/response/admin/get-all-filial-response-interface'

let BOOTSTRAP_DONE = false

export default function GlobalBootstrapper() {
  const { set, get } = useEncryptedCache()

  useEffect(() => {
    if (BOOTSTRAP_DONE) return

    const cached = get<GetAllFilialResponseInterface>('filialsByCompany')
    if (cached) {
      BOOTSTRAP_DONE = true
      return
    }

    let aborted = false
    ;(async () => {
      try {
        const idCompany = Number(env.NEXT_PUBLIC_ID_COMPANY)
        if (!idCompany) return

        const res = await GetAllFilialApi({
          id: 0,
          name: '',
          nit: '',
          active: true,
          idCompany,
          page: 0,
          size: 1000,
        })

        if (aborted) return
        set('filialsByCompany', res) // guarda el envelope
      } finally {
        BOOTSTRAP_DONE = true
      }
    })()

    return () => {
      aborted = true
    }
  }, [get, set])

  // Eliminar estilos inline left y top del elemento nextjs-portal
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null
    const interceptedElements = new WeakSet<HTMLElement>()

    const interceptElementStyle = (element: HTMLElement) => {
      if (interceptedElements.has(element)) return
      interceptedElements.add(element)

      // Interceptar setProperty para bloquear left y top
      const originalSetProperty = element.style.setProperty.bind(element.style)
      element.style.setProperty = function (property: string, value: string, priority?: string) {
        if (property === 'left' || property === 'top') {
          // Bloquear cualquier intento de establecer left o top
          return
        }
        return originalSetProperty(property, value, priority)
      }

      // Sobrescribir las propiedades left y top directamente
      try {
        Object.defineProperty(element.style, 'left', {
          get: () => '',
          set: () => {},
          configurable: true,
        })
        Object.defineProperty(element.style, 'top', {
          get: () => '',
          set: () => {},
          configurable: true,
        })
      } catch (e) {
        // Si no podemos usar defineProperty, continuamos con el método normal
      }
    }

    const removePortalStyles = () => {
      const portals = document.querySelectorAll('nextjs-portal')
      portals.forEach((portal) => {
        const element = portal as HTMLElement
        if (element) {
          // Interceptar el estilo la primera vez que vemos el elemento
          interceptElementStyle(element)

          // Limpiar del atributo style string directamente
          const currentStyle = element.getAttribute('style') || ''
          let updatedStyle = currentStyle
            .replace(/\s*left\s*:\s*[^;]+;?/gi, '')
            .replace(/\s*top\s*:\s*[^;]+;?/gi, '')
            .trim()
          updatedStyle = updatedStyle.replace(/^[;\s]+|[;\s]+$/g, '')

          if (updatedStyle !== currentStyle) {
            if (updatedStyle) {
              element.setAttribute('style', updatedStyle)
            } else {
              element.removeAttribute('style')
            }
          }

          // Intentar establecer como cadena vacía usando setProperty (será bloqueado por nuestro interceptor)
          // pero también intentamos directamente en caso de que el interceptor no funcione
          try {
            const styleDesc = element.style as any
            if (styleDesc.left !== undefined) {
              styleDesc.left = ''
            }
            if (styleDesc.top !== undefined) {
              styleDesc.top = ''
            }
          } catch (e) {
            // Ignorar errores
          }
        }
      })
    }

    // Ejecutar inmediatamente con múltiples intentos
    removePortalStyles()
    const timeout1 = setTimeout(removePortalStyles, 0)
    const timeout2 = setTimeout(removePortalStyles, 50)
    const timeout3 = setTimeout(removePortalStyles, 100)
    const timeout4 = setTimeout(removePortalStyles, 200)

    // Usar intervalo para verificar y eliminar continuamente (cada 250ms)
    intervalId = setInterval(removePortalStyles, 250)

    // Observar cambios en el DOM
    const observer = new MutationObserver(() => {
      requestAnimationFrame(removePortalStyles)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    })

    if (document.documentElement) {
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      })
    }

    return () => {
      clearTimeout(timeout1)
      clearTimeout(timeout2)
      clearTimeout(timeout3)
      clearTimeout(timeout4)
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
      observer.disconnect()
    }
  }, [])

  return null
}
