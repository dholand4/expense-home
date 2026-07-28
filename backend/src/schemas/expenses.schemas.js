import { z } from 'zod';

const CATEGORIES = [
  'alimentacao', 'transporte', 'moradia', 'saude', 'educacao', 'lazer',
  'vestuario', 'tecnologia', 'assinaturas', 'financiamento', 'emprestimo', 'pet', 'outros',
];

const SOURCE_TYPES = ['card', 'bill_account'];
const PAYMENT_TYPES = ['avista', 'parcelado', 'recorrente'];

export const createExpenseSchema = z.object({
  description: z.string().min(1),
  total_amount: z.coerce.number().positive(),
  installments: z.coerce.number().int().min(1).max(480).default(1),
  first_charge_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be yyyy-MM-dd'),
  payment_type: z.enum(PAYMENT_TYPES).default('avista'),
  category: z.enum(CATEGORIES).optional(),
  source_type: z.enum(SOURCE_TYPES),
  source_id: z.string().uuid(),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(1).optional(),
  total_amount: z.coerce.number().positive().optional(),
  installments: z.coerce.number().int().min(1).max(480).optional(),
  first_charge_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  payment_type: z.enum(PAYMENT_TYPES).optional(),
  category: z.enum(CATEGORIES).optional().nullable(),
  source_type: z.enum(SOURCE_TYPES).optional(),
  source_id: z.string().uuid().optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });
