import { z } from 'zod';

/** Trimmed e-mail; the empty case gets its own message. */
const email = z
  .string()
  .trim()
  .min(1, 'Enter your email')
  .pipe(z.email('Enter a valid email address'));

/** Rules for a new password (sign-up and reset). Login only checks that one was typed. */
const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters')
  .regex(/\d/, 'Include at least one number');

/** @param {{ password: string, confirmPassword: string }} values */
const passwordsMatch = (values) => values.password === values.confirmPassword;
const mismatch = { message: "Passwords don't match", path: ['confirmPassword'] };

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Enter your name').max(80, 'Use 80 characters or fewer'),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine(passwordsMatch, mismatch);

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine(passwordsMatch, mismatch);
