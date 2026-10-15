import { useId, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { useSendPasswordReset } from '../../queries/auth';
import AuthLayout from './AuthLayout';
import FormAlert from './FormAlert';
import TextField from './TextField';
import { authErrorMessage } from './authHelpers';
import { forgotPasswordSchema } from './schemas';

/** /forgot-password — always the same confirmation, so it never reveals whether an account exists. */
export default function ForgotPasswordPage() {
  const id = useId();
  const sendReset = useSendPasswordReset();
  const [sentTo, setSentTo] = useState(null);
  const [failure, setFailure] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });

  async function onValid({ email }) {
    setFailure(null);
    try {
      await sendReset.mutateAsync(email);
      setSentTo(email);
    } catch (err) {
      setFailure(err);
    }
  }

  const backToLogin = (
    <Link
      to="/login"
      className="inline-flex min-h-11 items-center rounded-btn px-1 font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      Back to log in
    </Link>
  );

  return (
    <AuthLayout
      icon={<KeyRound size={26} aria-hidden="true" />}
      title="Reset your password"
      text={sentTo ? undefined : "Enter your account email and we'll send you a link to set a new password."}
      footer={backToLogin}
    >
      {sentTo ? (
        <FormAlert tone="success">
          If an account exists for <span className="font-semibold break-all">{sentTo}</span>, we&apos;ve emailed a link to
          reset your password. Check your inbox and spam folder.
        </FormAlert>
      ) : (
        <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
          {failure && <FormAlert>{authErrorMessage(failure)}</FormAlert>}
          <TextField
            id={`${id}-email`}
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            enterKeyHint="send"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" size="lg" className="w-full" loading={sendReset.isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
