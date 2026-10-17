import { useState } from 'react';
import { MailCheck, Store, UserPlus } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { useHasPendingAction } from '../../stores/loginGate';
import AuthLayout from './AuthLayout';
import CheckInbox from './CheckInbox';
import SignupForm from './SignupForm';
import { useAfterAuth } from './useAfterAuth';
import { safeNextPath, withNext } from './authHelpers';

const linkClass =
  'inline-flex min-h-11 items-center rounded-btn px-1 font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/** /signup — `?as=seller` switches the copy and creates a seller profile; `?next=` is kept throughout. */
export default function SignupPage() {
  const status = useAuthStore((s) => s.status);
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'));
  const signupAs = params.get('as') === 'seller' ? 'seller' : 'customer';
  const [submitted, setSubmitted] = useState(false);
  const [sentTo, setSentTo] = useState(null);
  const hasPending = useHasPendingAction();
  const goNext = useAfterAuth(next);

  if (status === 'authenticated' && !submitted) return <Navigate to="/" replace />;

  function handleDone({ email, needsEmailConfirmation, hadPending }) {
    if (needsEmailConfirmation) setSentTo(email);
    else goNext({ hadPending });
  }

  if (sentTo) {
    // Confirmed in another tab of this browser (the session syncs across tabs): move on. With a pending
    // action GateResumer navigates instead; hasPending is live, so this re-renders when another tab
    // takes the action.
    if (status === 'authenticated' && !hasPending) return <Navigate to={next ?? '/'} replace />;
    return (
      <AuthLayout icon={<MailCheck size={26} aria-hidden="true" />} title="Check your inbox">
        <CheckInbox
          email={sentTo}
          onLoginStart={() => setSubmitted(true)}
          onLoggedIn={goNext}
          onChangeEmail={() => {
            setSubmitted(false);
            setSentTo(null);
          }}
        />
      </AuthLayout>
    );
  }

  const seller = signupAs === 'seller';
  return (
    <AuthLayout
      icon={seller ? <Store size={26} aria-hidden="true" /> : <UserPlus size={26} aria-hidden="true" />}
      title={seller ? 'Sell on Tibu' : 'Create your account'}
      text={
        seller
          ? 'Create your seller account first. Next you will set up your shop for review.'
          : 'Save favourites and contact homegrown sellers near you.'
      }
      footer={
        <p>
          Already have an account?{' '}
          <Link to={withNext('/login', next)} className={linkClass}>
            Log in
          </Link>
        </p>
      }
    >
      <SignupForm signupAs={signupAs} onSubmitStart={() => setSubmitted(true)} onDone={handleDone} />
    </AuthLayout>
  );
}
