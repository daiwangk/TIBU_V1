import { ExternalLink } from 'lucide-react';
import { callLink, whatsappLink } from '../../lib/whatsapp';
import AdminSection from './AdminSection';
import { instagramUrl, mapsLink, WHATSAPP_TEXT } from './adminModel';

const LINK = 'inline-flex min-h-11 items-center gap-1 font-body text-sm font-semibold text-primary underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn';

function Field({ label, children }) {
  return (
    <div className="flex flex-col border-b border-border px-4 py-2 last:border-b-0">
      <dt className="font-body text-xs text-muted">{label}</dt>
      <dd className="font-body text-sm text-ink">{children}</dd>
    </div>
  );
}

function ExternalA({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
      <ExternalLink size={14} aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/**
 * Where the seller is and how to reach them — phone numbers appear only on admin screens.
 *
 * @param {{
 *   business: import('../../services/contract.js').MyBusiness,
 *   row: import('../../services/contract.js').ApplicationRow,
 * }} props
 */
export default function ApplicationContact({ business, row }) {
  const phone = business.contacts?.phone ?? row.phone;
  const whatsapp = business.contacts?.whatsapp ?? row.whatsapp;
  const tel = phone ? callLink(phone) : null;
  const wa = whatsapp ? whatsappLink(whatsapp, WHATSAPP_TEXT) : null;
  const map = mapsLink(business.lat, business.lng);
  const handle = business.instagramHandle ?? row.instagramHandle;
  const insta = instagramUrl(handle);
  const place = [business.locality, business.city].filter(Boolean).join(', ');

  return (
    <AdminSection id="contact" title="Location and contact">
      <dl className="overflow-hidden rounded-card border border-border bg-surface">
        <Field label="Address">
          <span className="block">{business.addressText || 'No address'}</span>
          {place && <span className="block text-body">{place}</span>}
          {map ? <ExternalA href={map}>Open in Google Maps</ExternalA> : <span className="block text-muted">No map pin</span>}
        </Field>
        <Field label="Owner">
          <span className="block">{row.ownerName ?? 'Unknown'}</span>
          {row.ownerEmail && <a href={`mailto:${row.ownerEmail}`} className={LINK}>{row.ownerEmail}</a>}
        </Field>
        <Field label="Phone">
          {tel ? <a href={tel} className={LINK}>{phone}</a> : <span className="text-muted">{phone || 'Not added'}</span>}
        </Field>
        <Field label="WhatsApp">
          {wa ? <ExternalA href={wa}>{whatsapp}</ExternalA> : <span className="text-muted">{whatsapp || 'Not added'}</span>}
        </Field>
        <Field label="Instagram">
          {insta ? <ExternalA href={insta}>@{handle.replace(/^@/, '')}</ExternalA> : <span className="text-muted">Not added</span>}
        </Field>
      </dl>
    </AdminSection>
  );
}
