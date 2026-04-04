import { z } from 'zod'

export const incomeExpenseSchema = z.object({
  id: z.number().nullable().optional(),

  companyId: z.number({ required_error: 'La compañía es requerida' }).min(1, 'La compañía es requerida'),

  subsidiaryId: z.number({ required_error: 'La filial es requerida' }).min(1, 'La filial es requerida'),

  type: z
    .string({ required_error: 'El tipo es requerido' })
    .trim()
    .min(1, 'El tipo es requerido')
    .refine((val) => val === 'INGRESO' || val === 'EGRESO', {
      message: 'El tipo debe ser INGRESO o EGRESO',
    }),

  idModifiedBy: z.number().optional(),

  active: z.boolean(),

  idContractor: z.number().nullable().optional(),

  registerDate: z
    .string({ required_error: 'La fecha de registro es requerida' })
    .trim()
    .min(1, 'La fecha de registro es requerida')
    .refine(
      (val) => {
        if (!val) return false
        const date = new Date(val)
        return !isNaN(date.getTime())
      },
      {
        message: 'La fecha de registro debe ser una fecha válida',
      }
    ),

  concept: z
    .string({ required_error: 'El concepto es requerido' })
    .trim()
    .min(1, 'El concepto es requerido')
    .max(200, 'Máximo 200 caracteres'),

  value: z.number({ required_error: 'El valor es requerido' }).min(0, 'El valor debe ser mayor o igual a 0'),

  idCostCenter: z
    .number({ required_error: 'El centro de costo es requerido' })
    .min(1, 'El centro de costo es requerido'),

  tags: z.string().optional().nullable(),
})

export type IncomeExpenseSchemaType = z.infer<typeof incomeExpenseSchema>
