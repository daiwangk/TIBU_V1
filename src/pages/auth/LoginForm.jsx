import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/ui/Button';
import { useResendConfirmation, useSignIn } from '../../queries/auth';
import { peekPending } from '../../stores/loginGate';
import { authErrorMessage, isEmailNotConfirmed } from './authHelpers';
import FormAlert from './FormAlert';
import PasswordField from './PasswordField';
import TextField from './TextField';
import { loginSchema } from './schemas';

/**
 * The one login form: LoginPage, the "I've confirmed — log in" step after sign-up and LoginSheet.
 * It only signs in; the caller decides where to go next.
 *
 * `onSuccess({ hadPending })` — hadPending is read before signing in: when true a gated action is
 * waiting and GateResumer will navigate, so the caller should not.
 *
 * @param {{
 *   defaultEmail?: string,
 *   onSubmitStart?: () => void,
 *   onSuccess?: (info: { hadPending: boolean }) => void,
 * }} props
 */
export default function LoginForm({ defaultEmail = '', onSubmitStart, onSuccess }) {
  const id = useId();
  const signIn = useSignIn();
  const resend = useResendConfirmation();
  const [failure, setFailure] = useState(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: defaultEmail, password: '' } });

  async function onValid(values) {
    setFailure(null);
    resend.reset();
    const hadPending = !!peekPending();
    onSubmitStart?.();
    try {
      await signIn.mutateAsync(values);
      onSuccess?.({ hadPending });
    } catch (err) {
      setFailure(err);
    }
  }

  const unconfirmed = isEmailNotConfirmed(failure);

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
      {failure && (
        <FormAlert>
          <p>{authErrorMessage(failure)}</p>
          {unconfirmed && (
            <>
              <p className="mt-1">Open the link we emailed you, then log in.</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 -ml-3 min-h-11 underline"
                loading={resend.isPending}
                onClick={() => resend.mutate(getValues('email').trim())}
              >
                Resend email
              </Button>
            </>
          )}
        </FormAlert>
      )}
      {resend.isSuccess && <FormAlert tone="success">Sent. Check your inbox and spam folder.</FormAlert>}
      {resend.isError && <FormAlert>{authErrorMessage(resend.error)}</FormAlert>}

      <TextField
        id={`${id}-email`}
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        enterKeyHint="next"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordField
        id={`${id}-password`}
        label="Password"
        autoComplete="current-password"
        enterKeyHint="go"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" size="lg" className="w-full" loading={signIn.isPending}>
        Log in
      </Button>
    </form>
  );
}
