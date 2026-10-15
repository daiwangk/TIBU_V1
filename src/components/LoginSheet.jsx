import { lazy, Suspense } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gateTitle, signupHref } from '../lib/gateTitle';
import { useAuthStore } from '../stores/auth';
import { useLoginGateStore } from '../stores/loginGate';
import Button from './ui/Button';
import IconButton from './ui/IconButton';
import Sheet from './ui/Sheet';
import Spinner from './ui/Spinner';

// The form (react-hook-form + zod) downloads the first time the sheet opens, not with the app.
const LoginForm = lazy(() => import('../pages/auth/LoginForm'));

/**
 * Bottom sheet for gated actions (D10, D11), driven by `src/stores/loginGate.js`. Mounted once in App.jsx
 * (inside the router). After a successful login it closes and GateResumer replays the pending action.
 */
export default function LoginSheet() {
  const open = useLoginGateStore((s) => s.open);
  const pending = useLoginGateStore((s) => s.pending);
  const cancel = useLoginGateStore((s) => s.cancel);
  const close = useLoginGateStore((s) => s.close);
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();

  // Signed in meanwhile (e.g. in another tab): never show the sheet to a signed-in user.
  const visible = open && status !== 'authenticated';
  const title = gateTitle(pending);

  function createAccount() {
    // close(), not cancel(): the pending action stays in localStorage and resumes after sign-up.
    close();
    navigate(signupHref(pending?.returnTo));
  }

  return (
    <Sheet open={visible} onClose={cancel} label={title}>
      <div className="px-screen pb-[calc(24px+env(safe-area-inset-bottom))]">
        <div className="flex items-start gap-2">
          <div className="flex-1 pt-2">
            <h2 className="font-heading text-xl font-bold leading-tight text-ink">{title}</h2>
            <p className="mt-1 font-body text-sm text-body">Browsing is free. Log in once and we&apos;ll pick up right where you left off.</p>
          </div>
          <IconButton label="Close" onClick={cancel} className="-mr-2">
            <X size={20} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="mt-4">
          {visible && (
            <Suspense
              fallback={
                <div className="flex justify-center py-10" role="status" aria-label="Loading">
                  <Spinner size={28} />
                </div>
              }
            >
              <LoginForm onSuccess={() => close()} />
            </Suspense>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="font-body text-xs text-muted">New to Tibu?</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="secondary" size="lg" className="mt-4 w-full" onClick={createAccount}>
          Create an account
        </Button>
      </div>
    </Sheet>
  );
}
