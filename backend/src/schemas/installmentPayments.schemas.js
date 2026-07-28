import { z } from 'zod';

export const createInstallmentPaymentSchema = z.object({
  expense_id: z.string().uuid(),
  installment_number: z.coerce.number().int().min(1),
  paid_amount: z.coerce.number().positive(),
  paid_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be yyyy-MM-dd'),
  month_key: z.string().regex(/^\d{4}-\d{2}$/, 'Must be yyyy-MM'),
});
