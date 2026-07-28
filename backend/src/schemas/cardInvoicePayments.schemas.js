import { z } from 'zod';

export const createCardInvoicePaymentSchema = z.object({
  card_id: z.string().uuid(),
  month_key: z.string().regex(/^\d{4}-\d{2}$/, 'Must be yyyy-MM'),
  paid_amount: z.coerce.number().positive(),
  paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be yyyy-MM-dd'),
});

export const updateCardInvoicePaymentSchema = z.object({
  paid_amount: z.coerce.number().positive().optional(),
  paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });
