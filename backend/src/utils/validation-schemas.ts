import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const otpGenerateSchema = z.object({
  body: z.object({
    identifier: z.string().min(3, 'Email or mobile is required'),
    purpose: z.enum(['verification', 'login', 'reset']),
  }),
});

export const otpVerifySchema = z.object({
  body: z.object({
    identifier: z.string().min(3, 'Email or mobile is required'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    purpose: z.enum(['verification', 'login', 'reset']),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    mobile: z.string().optional(),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    label: z.string().min(1, 'Label is required'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().default('India'),
    isDefault: z.boolean().default(false),
  }),
});
