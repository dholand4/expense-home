import { z } from 'zod';

export const createBillAccountSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  due_day: z.coerce.number().int().min(1).max(31).optional(),
});

export const updateBillAccountSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  due_day: z.coerce.number().int().min(1).max(31).optional().nullable(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });
