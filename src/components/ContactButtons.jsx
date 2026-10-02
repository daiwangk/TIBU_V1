import { MessageCircle, Phone } from 'lucide-react';
import Button from './ui/Button';

/**
 * Contact buttons for communicating with a seller.
 * Primary: WhatsApp, Secondary: Call.
 *
 * @param {{
 *   business?: import('../services/contract.js').BusinessSummary,
 *   product?: import('../services/contract.js').ProductSummary | import('../services/contract.js').ProductDetail,
 *   onContact?: (channel: 'whatsapp' | 'call') => void,
 *   className?: string,
 * }} props
 */
export default function ContactButtons({
  business: _business,
  product: _product,
  onContact,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-3 w-full ${className}`}>
      <Button
        variant="primary"
        size="md"
        className="flex-1"
        onClick={() => onContact?.('whatsapp')}
      >
        <MessageCircle size={18} aria-hidden="true" />
        WhatsApp
      </Button>

      <Button
        variant="secondary"
        size="md"
        className="flex-1"
        onClick={() => onContact?.('call')}
      >
        <Phone size={18} aria-hidden="true" />
        Call
      </Button>
    </div>
  );
}
