import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Dialog from '../../components/ui/Dialog';
import { useSignOut } from '../../queries/auth';

/** "Log out" row with a confirm dialog. Cached data is cleared on SIGNED_OUT (AuthBootstrap). */
export default function LogoutButton() {
  const [confirming, setConfirming] = useState(false);
  const signOut = useSignOut();

  function confirm() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        setConfirming(false);
        toast.success('Logged out');
      },
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-card border border-border bg-surface px-4 font-body text-sm font-semibold text-ink hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <LogOut size={18} aria-hidden="true" />
        Log out
      </button>

      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Log out?">
        <div className="px-4 pb-4">
          <p className="font-body text-sm text-body">You can log back in any time with your email and password.</p>
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={signOut.isPending} onClick={confirm}>
              Log out
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
