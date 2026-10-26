import { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../lib/format.js';
import { enquiryGateAction, useSendEnquiry } from '../queries/enquiries.js';
import { useAuthStore } from '../stores/auth.js';
import { useLoginGateStore } from '../stores/loginGate.js';
import Button from './ui/Button.jsx';
import IconButton from './ui/IconButton.jsx';
import ImagePlaceholder from './ui/ImagePlaceholder.jsx';
import Sheet from './ui/Sheet.jsx';
import Textarea from './ui/Textarea.jsx';

const MAX_LENGTH = 2000;

/**
 * Bottom sheet for composing a new enquiry message to a business or about a product.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   business: { id: string, name: string, slug?: string },
 *   product?: { id: string, name: string, price: number, imageUrl?: string | null } | null,
 * }} props
 */
export default function EnquirySheet({ open, onClose, business, product = null }) {
  const [body, setBody] = useState('');
  const authStatus = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  const sendEnquiry = useSendEnquiry();

  if (!business) return null;

  const trimmed = body.trim();
  const isValid = trimmed.length > 0 && body.length <= MAX_LENGTH;

  function handleClose() {
    setBody('');
    onClose();
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if (!isValid || sendEnquiry.isPending) return;

    if (authStatus !== 'authenticated') {
      const action = enquiryGateAction({
        businessId: business.id,
        productId: product?.id ?? null,
        body: trimmed,
        returnTo: window.location.pathname,
      });
      useLoginGateStore.getState().request(action);
      handleClose();
      return;
    }

    sendEnquiry.mutate(
      {
        businessId: business.id,
        productId: product?.id ?? null,
        body: trimmed,
      },
      {
        onSuccess: (threadId) => {
          handleClose();
          navigate(`/enquiries/${encodeURIComponent(threadId)}`);
        },
      },
    );
  }

  return (
    <Sheet open={open} onClose={handleClose} label={`Send enquiry to ${business.name}`}>
      <form onSubmit={handleSubmit} className="flex flex-col px-screen pb-[calc(24px+env(safe-area-inset-bottom))]">
        <div className="flex items-start justify-between gap-3 pt-2">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">Send enquiry</h2>
            <p className="font-body text-xs text-muted">to {business.name}</p>
          </div>
          <IconButton label="Close enquiry sheet" onClick={handleClose} className="-mr-2">
            <X size={20} aria-hidden="true" />
          </IconButton>
        </div>

        {product && (
          <div className="mt-3 flex items-center gap-3 rounded-card border border-border bg-bg/50 p-2.5">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-btn bg-surface">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-semibold text-ink">{product.name}</p>
              <p className="font-heading text-xs font-bold text-primary">{formatPrice(product.price)}</p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Textarea
            id="enquiry-message-input"
            label="Your message"
            placeholder="Ask about availability, customisation, details..."
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={sendEnquiry.isPending}
            autoFocus
          />
          <div className="mt-1 flex justify-end">
            <span
              className={`font-body text-[11px] ${
                body.length > MAX_LENGTH ? 'font-semibold text-error' : 'text-muted'
              }`}
            >
              {body.length} / {MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="flex-1"
            onClick={handleClose}
            disabled={sendEnquiry.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            loading={sendEnquiry.isPending}
            disabled={!isValid || sendEnquiry.isPending}
          >
            <Send size={16} aria-hidden="true" />
            Send enquiry
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
