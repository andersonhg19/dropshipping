'use client'

import { useCallback, useMemo, useState } from 'react'

import { z } from 'zod'

type ErrorMap<T> = Partial<Record<keyof T & string, string>>

export function useValidator<T extends Record<string, any>>(
  schema: z.ZodType<T>,
  opts?: { translate?: (msg: string, path?: string) => string }
) {
  const [errors, setErrors] = useState<ErrorMap<T>>({})

  const parse = useCallback(
    (values: T) => {
      const res = schema.safeParse(values)
      if (res.success) {
        setErrors({})
        return { ok: true as const, data: res.data }
      }
      const next: ErrorMap<T> = {}
      for (const issue of res.error.issues) {
        const path = (issue.path?.[0] as string) || ''
        const msg = opts?.translate ? opts.translate(issue.message, path) : issue.message
        if (path) next[path as keyof T & string] = msg
      }
      setErrors(next)
      return { ok: false as const, errors: next }
    },
    [schema, opts]
  )

  const validateField = useCallback(
    (name: keyof T & string, value: any, allValues: T) => {
      // Validamos el formulario con el valor actualizado, pero devolvemos solo el error del campo
      const draft = { ...allValues, [name]: value }
      const res = schema.safeParse(draft)
      if (res.success) {
        setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
        return { ok: true as const }
      }
      const fieldIssue = res.error.issues.find((i) => (i.path?.[0] as string) === name)
      const msg = fieldIssue
        ? opts?.translate
          ? opts.translate(fieldIssue.message, name)
          : fieldIssue.message
        : undefined
      setErrors((prev) => ({ ...prev, [name]: msg }))
      return msg ? { ok: false as const, message: msg } : { ok: true as const }
    },
    [schema, opts]
  )

  return useMemo(
    () => ({
      errors,
      setErrors,
      validateAll: parse,
      validateField,
    }),
    [errors, parse, validateField]
  )
}
