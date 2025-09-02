import { z } from 'zod';

import { UserRoleEnum } from '@/types/userTypes';

export const PASSWORD_MIN_LENGTH = 8; // Minimum length for passwords

export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(150, 'Username cannot exceed 150 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email cannot exceed 254 characters');

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const userSchema = z.object({
  id: z.string(),
  username: usernameSchema,
  email: emailSchema,
  display_name: z.string().max(150).optional(),
  role: z.nativeEnum(UserRoleEnum),
  created_at: z.string(),
  updated_at: z.string(),
  is_active: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirm: z.string(),
    role: z.nativeEnum(UserRoleEnum).optional(),
  })
  .refine(data => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirm: z.string(),
  })
  .refine(data => data.password === data.password_confirm, {
    message: 'Passwords do not match',
    path: ['password_confirm'],
  });

export type UserSchema = z.infer<typeof userSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
