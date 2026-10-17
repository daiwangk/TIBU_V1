import { useId, useState } from 'react';
import { KeyRound, Unlink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useUpdatePassword } from '../../queries/auth';
import { useAuthStore } from '../../stores/auth';
import AuthLayout from './AuthLayout';
import FormAlert from './FormAlert';
import PasswordField from './PasswordField';
import { authErrorMessage, linkErrorMessage } from './authHelpers';
import { resetPasswordSchema } from './schemas';

/**
 * /reset-password — the e-mail link signs the user in (supabase-js reads the URL), then they choose a
 * new password. No session after loading, or an error on the link → ask for a new link.
 */
export default function ResetPasswordPage() {
  const id = useId();
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const update = useUpdatePassword();
  const [failure, setFailure] = useState(null);
  const [linkError] = useState(() => linkErrorMessage(window.location.hash, window.location.search));
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } });

  async function onValid({ password }) {
    setFailure(null);
    try {
      await update.mutateAsync(password);
      toast.success('Password updated');
      navigate('/', { replace: true });
    } catch (err) {
      setFailure(err);
    }
  }

  if (status === 'loading' && !linkError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-bg" role="status" aria-label="Loading">
        <Spinner size={32} />
      </div>
    );
  }

  if (linkError || status !== 'authenticated') {
    return (
      <AuthLayout
        icon={<Unlink size={26} aria-hidden="true" />}
        title="Link not valid"
        text={`${linkError ?? 'This link is invalid or has expired.'} Ask for a new one below.`}
      >
        <Button to="/forgot-password" size="lg" className="w-full">
          Send a new link
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={<KeyRound size={26} aria-hidden="true" />} title="Choose a new password">
      <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-4">
        {failure && <FormAlert>{authErrorMessage(failure)}</FormAlert>}
        <PasswordField
          id={`${id}-password`}
          label="New password"
          autoComplete="new-password"
          enterKeyHint="next"
          error={errors.password?.message}
          {...register('password')}
        />
        {!errors.password && <p className="-mt-3 font-body text-xs text-muted">At least 8 characters, including a number.</p>}
        <PasswordField
          id={`${id}-confirm`}
          label="Confirm new password"
          autoComplete="new-password"
          enterKeyHint="go"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" size="lg" className="w-full" loading={update.isPending}>
          Save password
        </Button>
      </form>
    </AuthLayout>
  );
}
