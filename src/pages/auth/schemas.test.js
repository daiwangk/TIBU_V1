import { zodResolver } from '@hookform/resolvers/zod';
import { describe, expect, it } from 'vitest';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from './schemas.js';

/** First error message per field, as a form would show it. */
function errorsOf(schema, values) {
  const result = schema.safeParse(values);
  if (result.success) return {};
  const out = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

const validSignup = {
  fullName: '  Asha Rao ',
  email: ' asha@example.com ',
  password: 'cookies42',
  confirmPassword: 'cookies42',
};

describe('loginSchema', () => {
  it('accepts an email and any non-empty password, trimming the email', () => {
    expect(loginSchema.parse({ email: ' a@b.co ', password: 'x' })).toEqual({ email: 'a@b.co', password: 'x' });
  });

  it('asks for missing values and rejects a malformed email', () => {
    expect(errorsOf(loginSchema, { email: '', password: '' })).toEqual({
      email: 'Enter your email',
      password: 'Enter your password',
    });
    expect(errorsOf(loginSchema, { email: 'not-an-email', password: 'x' })).toEqual({
      email: 'Enter a valid email address',
    });
  });
});

describe('signupSchema', () => {
  it('accepts valid input and trims name and email', () => {
    expect(signupSchema.parse(validSignup)).toEqual({
      fullName: 'Asha Rao',
      email: 'asha@example.com',
      password: 'cookies42',
      confirmPassword: 'cookies42',
    });
  });

  it('requires 8+ characters with a number', () => {
    expect(errorsOf(signupSchema, { ...validSignup, password: 'abc1', confirmPassword: 'abc1' }).password)
      .toBe('Use at least 8 characters');
    expect(errorsOf(signupSchema, { ...validSignup, password: 'abcdefgh', confirmPassword: 'abcdefgh' }).password)
      .toBe('Include at least one number');
  });

  it('flags mismatched passwords on the confirm field', () => {
    expect(errorsOf(signupSchema, { ...validSignup, confirmPassword: 'cookies43' })).toEqual({
      confirmPassword: "Passwords don't match",
    });
  });

  it('requires a name of at most 80 characters', () => {
    expect(errorsOf(signupSchema, { ...validSignup, fullName: '   ' }).fullName).toBe('Enter your name');
    expect(errorsOf(signupSchema, { ...validSignup, fullName: 'a'.repeat(81) }).fullName).toBe('Use 80 characters or fewer');
  });
});

describe('forgot and reset schemas', () => {
  it('forgot needs a valid email', () => {
    expect(errorsOf(forgotPasswordSchema, { email: 'x' })).toEqual({ email: 'Enter a valid email address' });
    expect(forgotPasswordSchema.parse({ email: 'a@b.co' })).toEqual({ email: 'a@b.co' });
  });

  it('reset applies the new-password rules and the match check', () => {
    expect(errorsOf(resetPasswordSchema, { password: 'short1', confirmPassword: 'short1' }).password)
      .toBe('Use at least 8 characters');
    expect(errorsOf(resetPasswordSchema, { password: 'longer123', confirmPassword: 'longer124' })).toEqual({
      confirmPassword: "Passwords don't match",
    });
  });
});

// @hookform/resolvers v5 + zod 4: the resolver react-hook-form calls must return values / field errors.
describe('zodResolver compatibility', () => {
  const options = { fields: {}, shouldUseNativeValidation: false };

  it('returns parsed values on success', async () => {
    const result = await zodResolver(signupSchema)(validSignup, undefined, options);
    expect(result.errors).toEqual({});
    expect(result.values.email).toBe('asha@example.com');
  });

  it('returns field errors (including refine paths) on failure', async () => {
    const result = await zodResolver(signupSchema)(
      { ...validSignup, email: 'nope', confirmPassword: 'different1' },
      undefined,
      options,
    );
    expect(result.values).toEqual({});
    expect(result.errors.email.message).toBe('Enter a valid email address');
    // zod 4 still runs the match check when another field fails, so both show at once.
    expect(result.errors.confirmPassword.message).toBe("Passwords don't match");
  });
});
