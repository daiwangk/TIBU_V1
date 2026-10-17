import { useState } from 'react';
import Button from '../../components/ui/Button';
import { useResendConfirmation } from '../../queries/auth';
import { authErrorMessage } from './authHelpers';
import FormAlert from './FormAlert';
import LoginForm from './LoginForm';

/**
 * After sign-up with e-mail confirmation on. Offers "Resend email" and "I've confirmed — log in", which
 * shows the login form right here, so an iPhone user whose mail app confirmed in its own browser can
 * finish in the tab that holds the pending action.
 *
 * @param {{
 *   email: string,
 *   onLoggedIn: (info: { hadPending: boolean }) => void,
 *   onLoginStart?: () => void,
 *   onChangeEmail: () => void,
 * }} props
 */
export default function CheckInbox({ email, onLoggedIn, onLoginStart, onChangeEmail }) {
  const resend = useResendConfirmation();
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-body text-sm text-body">Confirmed your email? Log in to continue.</p>
        <LoginForm defaultEmail={email} onSubmitStart={onLoginStart} onSuccess={onLoggedIn} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-body text-sm text-body">
        We sent a confirmation link to <span className="font-semibold text-ink break-all">{email}</span>. Open it to finish
        creating your account. It can take a minute; check spam too.
      </p>
      {resend.isSuccess && <FormAlert tone="success">Sent again. Check your inbox and spam folder.</FormAlert>}
      {resend.isError && <FormAlert>{authErrorMessage(resend.error)}</FormAlert>}
      <Button size="lg" className="w-full" onClick={() => setShowLogin(true)}>
        I&apos;ve confirmed — log in
      </Button>
      <Button variant="secondary" className="w-full" loading={resend.isPending} onClick={() => resend.mutate(email)}>
        Resend email
      </Button>
      <Button variant="ghost" className="w-full" onClick={onChangeEmail}>
        Use a different email
      </Button>
    </div>
  );
}
