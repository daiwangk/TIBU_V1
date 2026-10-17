import { Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { saveGateAction } from '../lib/savedHelpers';
import { useIsSaved, useToggleSave } from '../queries/saved';
import { useAuthStore } from '../stores/auth';
import { useLoginGateStore } from '../stores/loginGate';
import IconButton from './ui/IconButton';

/**
 * Heart toggle for a product or business. Signed in → optimistic save/unsave; guest → login sheet, and
 * the save happens after login (GateResumer replays it). Safe inside a card link: the tap never
 * follows the link.
 *
 * @param {{ kind: 'product' | 'business', id: string, overlay?: boolean, className?: string }} props
 *   overlay — round light background for use on top of card images
 */
export default function SaveButton({ kind, id, overlay = false, className = '' }) {
  const status = useAuthStore((s) => s.status);
  const saved = useIsSaved(kind, id);
  const toggle = useToggleSave();
  const requestLogin = useLoginGateStore((s) => s.request);
  const { pathname, search } = useLocation();

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (status === 'loading') return;
    if (status !== 'authenticated') {
      requestLogin(saveGateAction(kind, id, pathname + search));
      return;
    }
    toggle.mutate({ kind, id, saved: !saved });
  }

  return (
    <IconButton
      label={saved ? 'Remove from saved' : 'Save'}
      aria-pressed={saved}
      onClick={handleClick}
      className={`${saved ? 'text-primary' : 'text-ink'} hover:text-primary ${overlay ? 'rounded-full bg-surface shadow-sm ring-1 ring-border' : ''} ${className}`}
    >
      <Heart size={20} aria-hidden="true" className={saved ? 'fill-current' : ''} />
    </IconButton>
  );
}
