import { z } from 'zod';

export const updateUserSchema = z.object({
  full_name: z.string().optional(),
  role: z.enum(['admin', 'user']).optional(),
  status: z.enum(['active', 'invited', 'disabled']).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'At least one field required' });
