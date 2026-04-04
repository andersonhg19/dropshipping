import { z } from 'zod'

export const typeUserSchema = z.object({
  id: z.union([z.number(), z.string()]).nullable().optional(),
  idCompany: z.number().nullable().optional(),
  idSubsidiary: z.number().nullable().optional(),

  name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(1, 'El nombre es requerido')
    .max(150, 'Máximo 150 caracteres'),

  active: z.boolean(),
  idModifiedBy: z.number().optional(),
})

export type TypeUserSchemaType = z.infer<typeof typeUserSchema>
