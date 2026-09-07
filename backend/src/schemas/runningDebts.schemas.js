import { z } from 'zod';

export const createRunningDebtSchema = z.object({
  name: z.string().min(1),
  total_amount: z.coerce.number().min(0).default(0),
  amount_paid: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});

export const updateRunningDebtSchema = z.object({
  name: z.string().min(1).optional(),
  total_amount: z.coerce.number().min(0).optional(),
  amount_paid: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });

export const createDebtTransactionSchema = z.object({
  debt_id: z.string().uuid(),
  type: z.enum(['charge', 'payment']),
  amount: z.coerce.number().min(0).default(0),
  date: z.string().or(z.date()).optional(),
  notes: z.string().optional().nullable(),
});
