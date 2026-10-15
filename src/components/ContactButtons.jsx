import { MessageCircle, Phone } from 'lucide-react';
import Button from './ui/Button';

/**
 * Contact buttons for communicating with a seller.
 * Primary: WhatsApp, Secondary: Call. While one channel is being revealed it shows a spinner and both
 * are disabled.
 *
 * @param {{
 *   onContact?: (channel: 'whatsapp' | 'call') => void,
 *   loadingChannel?: 'whatsapp' | 'call' | null,
 *   className?: string,
 * }} props
 */
export default function ContactButtons({ onContact, loadingChannel = null, className = '' }) {
  const busy = loadingChannel != null;

  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <Button
        variant="primary"
        size="md"
        className="flex-1"
        loading={loadingChannel === 'whatsapp'}
        disabled={busy}
        onClick={() => onContact?.('whatsapp')}
      >
        {loadingChannel !== 'whatsapp' && <MessageCircle size={18} aria-hidden="true" />}
        WhatsApp
      </Button>

      <Button
        variant="secondary"
        size="md"
        className="flex-1"
        loading={loadingChannel === 'call'}
        disabled={busy}
        onClick={() => onContact?.('call')}
      >
        {loadingChannel !== 'call' && <Phone size={18} aria-hidden="true" />}
        Call
      </Button>
    </div>
  );
}
