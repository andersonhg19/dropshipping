import { z } from 'zod'

export const companySchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),

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
  contactPerson: z.string().trim().max(150, 'Máximo 150 caracteres').optional().nullable(),

  phone: z.string().trim().regex(/^\d*$/, 'Solo números').optional().nullable(),

  email: z.string().trim().email('Formato de correo inválido').optional().nullable(),

  active: z.boolean(),
  idModifiedBy: z.number().optional(),
})

export type CompanySchemaType = z.infer<typeof companySchema>
