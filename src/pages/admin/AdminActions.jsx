import { useState } from 'react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import { shouldToast } from '../../lib/errors';
import { useDecideApplication } from '../../queries/admin';
import { allowedActions, decideErrorMessage } from './adminModel';
import ReasonDialog from './ReasonDialog';

const DIALOG_TITLES = { reject: 'Reject application', unpublish: 'Unpublish shop' };

/**
 * The decision buttons for a business's current status. Approve / Republish act on one tap; Reject and
 * Unpublish ask for a reason first. The page stays put and shows the new status once the data refreshes.
 *
 * @param {{ business: import('../../services/contract.js').MyBusiness }} props
 */
export default function AdminActions({ business }) {
  const decide = useDecideApplication();
  const [asking, setAsking] = useState(null);
  const [dialogError, setDialogError] = useState(null);
  const actions = allowedActions(business.status);

  if (actions.length === 0) return null;

  function closeDialog() {
    setAsking(null);
    setDialogError(null);
  }

  function run(item, reason = null) {
    decide.mutate(
      { businessId: business.id, action: item.action, reason },
      {
        onSuccess: () => {
          closeDialog();
          toast.success(item.doneMessage);
        },
        onError: (err) => {
          // The status moved (or the business is gone): close, the refreshed page shows the real state.
          if (err?.code === 'conflict' || err?.code === 'not_found') {
            closeDialog();
            toast.error(decideErrorMessage(err));
            return;
          }
          // Anything else keeps the dialog, and the typed reason, open for another try.
          if (item.needsReason && err?.code === 'validation') {
            setDialogError(decideErrorMessage(err));
            return;
          }
          // Network / forbidden / unknown errors already raise the global toast.
          if (!shouldToast(err)) toast.error(decideErrorMessage(err));
        },
      },
    );
  }

  return (
    <>
      <div className="flex gap-3">
        {actions.map((item) => (
          <Button
            key={item.action}
            type="button"
            variant={item.variant}
            className="flex-1"
            disabled={decide.isPending}
            loading={decide.isPending && !item.needsReason && decide.variables?.action === item.action}
            onClick={() => (item.needsReason ? setAsking(item) : run(item))}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <ReasonDialog
        open={asking !== null}
        title={asking ? DIALOG_TITLES[asking.action] : ''}
        confirmLabel={asking?.label ?? ''}
        onConfirm={(reason) => run(asking, reason)}
        onCancel={closeDialog}
        loading={decide.isPending}
        serverError={dialogError}
      />
    </>
  );
}
