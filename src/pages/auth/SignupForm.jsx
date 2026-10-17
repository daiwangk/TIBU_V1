import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../components/ui/Button';
import { useSignUp } from '../../queries/auth';
import { peekPending } from '../../stores/loginGate';
import { authErrorMessage } from './authHelpers';
import FormAlert from './FormAlert';
import PasswordField from './PasswordField';
import TextField from './TextField';
import { signupSchema } from './schemas';

/**
 * Sign-up fields. Calls `onDone({ email, needsEmailConfirmation, hadPending })` after a successful sign-up.
 *
 * @param {{
 *   signupAs: 'customer' | 'seller',
 *   onSubmitStart?: () => void,
 *   onDone: (result: { email: string, needsEmailConfirmation: boolean, hadPending: boolean }) => void,
 * }} props
 */
export default function SignupForm({ signupAs, onSubmitStart, onDone }) {
  const id = useId();
  const signUp = useSignUp();
  const [failure, setFailure] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  async function onValid({ fullName, email, password }) {
    setFailure(null);
    const hadPending = !!peekPending();
    onSubmitStart?.();
    try {
      const { needsEmailConfirmation } = await signUp.mutateAsync({ email, password, fullName, signupAs });
      onDone({ email, needsEmailConfirmation, hadPending });
    } catch (err) {
      setFailure(err);
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
      {failure && <FormAlert>{authErrorMessage(failure)}</FormAlert>}
      <TextField
        id={`${id}-name`}
        label="Full name"
        autoComplete="name"
        enterKeyHint="next"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
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
        autoComplete="new-password"
        enterKeyHint="next"
        error={errors.password?.message}
        {...register('password')}
      />
      {!errors.password && <p className="-mt-3 font-body text-xs text-muted">At least 8 characters, including a number.</p>}
      <PasswordField
        id={`${id}-confirm`}
        label="Confirm password"
        autoComplete="new-password"
        enterKeyHint="go"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" size="lg" className="w-full" loading={signUp.isPending}>
        {signupAs === 'seller' ? 'Create seller account' : 'Create account'}
      </Button>
    </form>
  );
}
