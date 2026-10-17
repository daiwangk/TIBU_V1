import { useMutation } from '@tanstack/react-query';
import {
  resendConfirmation,
  sendPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '../services/index.js';

// Auth forms show their own inline errors, so these mutations never raise the global toast.
const silent = { silent: true };

/** `signIn({ email, password })` → Session. The auth store updates through onAuthChange. */
export function useSignIn() {
  return useMutation({ mutationFn: (input) => signIn(input), meta: silent });
}

/** `signUp({ email, password, fullName, signupAs })` → `{ needsEmailConfirmation }`. */
export function useSignUp() {
  return useMutation({ mutationFn: (input) => signUp(input), meta: silent });
}

/** `resendConfirmation(email)`. */
export function useResendConfirmation() {
  return useMutation({ mutationFn: (email) => resendConfirmation(email), meta: silent });
}

/** `sendPasswordReset(email)`. */
export function useSendPasswordReset() {
  return useMutation({ mutationFn: (email) => sendPasswordReset(email), meta: silent });
}

/** `updatePassword(newPassword)`. */
export function useUpdatePassword() {
  return useMutation({ mutationFn: (password) => updatePassword(password), meta: silent });
}

/** `signOut()`. Cached queries are cleared by AuthBootstrap on SIGNED_OUT; failures toast globally. */
export function useSignOut() {
  return useMutation({ mutationFn: () => signOut() });
}
