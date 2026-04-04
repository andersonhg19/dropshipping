import { z } from 'zod'

export const contractorSchema = z.object({
  id: z.union([z.number(), z.string()]).optional().nullable(),

  companyId: z
    .number({ required_error: 'La empresa es requerida' })
    .int('Valor inválido')
    .min(1, 'La empresa es requerida'),

  subsidiaryId: z
    .number({ required_error: 'La filial es requerida' })
    .int('Valor inválido')
    .min(1, 'La filial es requerida'),

  name: z
    .string({ required_error: 'El nombre del convenio es requerido' })
    .trim()
    .min(1, 'El nombre del convenio es requerido')
    .max(150, 'Máximo 150 caracteres'),

  nit: z.string().trim().max(30, 'Máximo 30 caracteres').optional().or(z.literal('')),

  contactName: z.string().trim().max(150, 'Máximo 150 caracteres').optional().or(z.literal('')),

  phone: z.string().trim().regex(/^\d*$/, 'Solo números').max(20, 'Máximo 20 dígitos').optional().or(z.literal('')),

  email: z.string().trim().email('Formato de correo inválido').optional().or(z.literal('')),

  address: z.string().trim().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),

  contactPhone: z
    .string()
    .trim()
    .regex(/^\d*$/, 'Solo números')
    .max(20, 'Máximo 20 dígitos')
    .optional()
    .or(z.literal('')),

  paymentTermDays: z
    .number({ required_error: 'Término de pago inválido' })
    .int('Debe ser entero')
    .min(0, 'No puede ser negativo'),

  active: z.boolean(),
  idModifiedBy: z.number().optional(),
})

export type ContractorSchemaType = z.infer<typeof contractorSchema>
