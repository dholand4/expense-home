import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().optional(),
});

export const inviteSchema = z.object({
  email: z.string().email(),
  full_name: z.string().optional(),
  role: z.enum(['admin', 'user']).default('user'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});
