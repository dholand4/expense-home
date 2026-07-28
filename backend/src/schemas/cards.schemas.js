import { z } from 'zod';

export const createCardSchema = z.object({
  name: z.string().min(1),
  credit_limit: z.coerce.number().positive(),
  due_day: z.coerce.number().int().min(1).max(31),
});

export const updateCardSchema = z.object({
  name: z.string().min(1).optional(),
  credit_limit: z.coerce.number().positive().optional(),
  due_day: z.coerce.number().int().min(1).max(31).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });
