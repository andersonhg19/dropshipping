// @core/validations/user-schema.ts
import { z } from 'zod'

export const userSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  idCompany: z.number({ required_error: 'La empresa es requerida' }).int().min(1, 'La empresa es requerida'),
  idSubsidiary: z.number({ required_error: 'La filial es requerida' }).int().min(1, 'La filial es requerida'),
  idTypeUser: z.number({ required_error: 'El tipo de usuario es requerido' }).int().min(1, 'El tipo de usuario es requerido'),

  // Reglas solicitadas:
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .trim()
    .min(1, 'El nombre es requerido')
    .max(150, 'Máximo 150 caracteres'),

  lastName: z
    .string({ required_error: 'El apellido es requerido' })
    .trim()
    .min(1, 'El apellido es requerido')
    .max(150, 'Máximo 150 caracteres'),

  dni: z
    .string({ required_error: 'El DNI es requerido' })
    .trim()
    .min(1, 'El DNI es requerido')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9]+$/, 'Solo alfanumérico'),

  email: z
    .string({ required_error: 'El correo es requerido' })
    .trim()
    .min(1, 'El correo es requerido')
    .email('Formato de correo inválido'),

  cellphone: z
    .string({ required_error: 'El celular es requerido' })
    .trim()
    .min(1, 'El celular es requerido')
    .regex(/^\d+$/, 'Solo números'),

  active: z.boolean(),
  admin: z.boolean().optional(),
  idModifiedBy: z.number().optional(),
})

// Utilidad: tipo inferido
export type UserSchemaType = z.infer<typeof userSchema>
