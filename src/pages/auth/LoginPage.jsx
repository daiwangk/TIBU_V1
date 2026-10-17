import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import { useAfterAuth } from './useAfterAuth';
import { safeNextPath, withNext } from './authHelpers';

const linkClass =
  'inline-flex min-h-11 items-center rounded-btn px-1 font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/** /login — email + password. `?next=` is honoured after a successful login. */
export default function LoginPage() {
  const status = useAuthStore((s) => s.status);
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  // Set once this screen starts a login, so the store flipping to 'authenticated' isn't mistaken for
  // a signed-in visitor (who is sent Home).
  const [submitted, setSubmitted] = useState(false);
  const handleSuccess = useAfterAuth(next);

  if (status === 'authenticated' && !submitted) return <Navigate to="/" replace />;

  return (
    <AuthLayout
      icon={<LogIn size={26} aria-hidden="true" />}
      title="Welcome back"
      text="Log in to contact sellers, save favourites and pick up where you left off."
      footer={
        <p>
          New to Tibu?{' '}
          <Link to={withNext('/signup', next)} className={linkClass}>
            Create an account
          </Link>
        </p>
      }
    >
      <LoginForm onSubmitStart={() => setSubmitted(true)} onSuccess={handleSuccess} />
      <div className="mt-3 flex justify-center">
        <Link to="/forgot-password" className={linkClass}>
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
}
