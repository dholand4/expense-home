import { z } from 'zod';

export const createSharedAccessSchema = z.object({
  shared_with_email: z.string().email(),
});

export const updateSharedAccessSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']),
});
