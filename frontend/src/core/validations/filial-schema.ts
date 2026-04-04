import { z } from 'zod'

export const filialSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  idCompany: z.number({ required_error: 'La empresa es requerida' }).min(1, 'La empresa es requerida'),

  name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(1, 'El nombre es requerido')
    .max(150, 'Máximo 150 caracteres'),

  nit: z
    .string({ required_error: 'El NIT es requerido' })
    .trim()
    .min(1, 'El NIT es requerido')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9.-]+$/, 'Solo alfanumérico (se permite . y -)'),

  address: z.string().trim().max(200, 'Máximo 200 caracteres').optional().nullable(),

  legalRepresentative: z.string().trim().max(150, 'Máximo 150 caracteres').optional().nullable(),

  phone: z.string().trim().regex(/^\d*$/, 'Solo números').optional().nullable(),

  email: z.string().trim().email('Formato de correo inválido').optional().nullable(),

  image: z.string().trim().optional().nullable(),

  active: z.boolean(),
  idModifiedBy: z.number().optional(),
  companyName: z.string().optional().nullable(),
  modifiedBy: z.string().optional().nullable(),
})

export type FilialSchemaType = z.infer<typeof filialSchema>
