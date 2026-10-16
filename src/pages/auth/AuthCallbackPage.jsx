import { useState } from 'react';
import { CircleCheck, Unlink } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useAuthStore } from '../../stores/auth';
import { useHasPendingAction } from '../../stores/loginGate';
import AuthLayout from './AuthLayout';
import { linkErrorMessage, safeNextPath } from './authHelpers';

function Waiting({ label }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-bg px-screen text-center" role="status">
      <Spinner size={32} />
      <p className="font-body text-sm text-body">{label}</p>
    </div>
  );
}

/**
 * /auth/callback — where the confirmation e-mail lands. supabase-js reads the token from the URL and
 * the auth store flips to 'authenticated'.
 * - A pending gated action in this browser → GateResumer navigates back to it and replays it.
 * - No pending action → say so, because the person may have started in another app (iPhone mail apps
 *   open links in their own browser) and needs to go back there.
 */
export default function AuthCallbackPage() {
  const status = useAuthStore((s) => s.status);
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const [linkError] = useState(() => linkErrorMessage(window.location.hash, window.location.search));
  // Live: if another tab's GateResumer takes the action, this re-renders into "Email confirmed" instead
  // of waiting for a navigation that will never come.
  const hasPending = useHasPendingAction();

  if (linkError || status === 'guest') {
    return (
      <AuthLayout
        icon={<Unlink size={26} aria-hidden="true" />}
        title="Link not valid"
        text={`${linkError ?? 'This link is invalid or has expired.'} If you already confirmed, just log in.`}
      >
        <Button to="/login" size="lg" className="w-full">
          Log in
        </Button>
      </AuthLayout>
    );
  }

  if (status === 'loading') return <Waiting label="Confirming your email…" />;
  if (hasPending) return <Waiting label="Taking you back…" />;

  return (
    <AuthLayout
      icon={<CircleCheck size={26} aria-hidden="true" />}
      title="Email confirmed"
      text="If you started on another tab or app, go back there and log in."
    >
      <Button to={next ?? '/'} size="lg" className="w-full" replace>
        Continue here
      </Button>
    </AuthLayout>
  );
}
