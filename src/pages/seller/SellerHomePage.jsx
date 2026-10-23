import { ChevronRight, Clapperboard, ExternalLink, MessageCircle, Package, Pencil, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import Switch from '../../components/ui/Switch';
import { shouldToast, userMessage } from '../../lib/errors';
import { useSetAvailableToday } from '../../queries/seller';
import SellerPage from './SellerPage';
import SellerStatusBanner from './SellerStatusBanner';
import SellerStats from './SellerStats';
import { SWITCH_ROW } from './switchRow';

function AvailableTodayCard({ business }) {
  const setAvailable = useSetAvailableToday();
  // Show the new value straight away while the save and refresh are in flight.
  const checked = setAvailable.isPending ? setAvailable.variables.value : business.availableToday;

  function handleChange(value) {
    setAvailable.mutate(
      { kind: 'business', id: business.id, value },
      { onError: (err) => !shouldToast(err) && toast.error(userMessage(err)) },
    );
  }

  return (
    <section aria-label="Available today" className="flex flex-col rounded-card border border-border bg-surface px-4 py-1">
      <Switch
        id="seller-available-today"
        className={SWITCH_ROW}
        label="My shop is available today"
        checked={checked}
        disabled={setAvailable.isPending}
        onChange={handleChange}
      />
      <p className="pb-3 font-body text-xs text-muted">Shows you in “Available today” on Home. Resets at midnight.</p>
    </section>
  );
}

function QuickLinks({ business }) {
  const links = [
    { to: '/seller/products', label: 'Products', Icon: Package },
    { to: '/seller/videos', label: 'Videos', Icon: Clapperboard },
    { to: '/seller/business', label: 'Edit business', Icon: Pencil },
    { to: '/seller/enquiries', label: 'Messages', Icon: MessageCircle },
    { to: '/seller/reviews', label: 'Reviews', Icon: Star },
  ];
  if (business.status === 'approved') links.push({ to: `/b/${business.slug}`, label: 'View public page', Icon: ExternalLink });

  return (
    <nav aria-label="Seller sections">
      <ul className="overflow-hidden rounded-card border border-border bg-surface">
        {links.map(({ to, label, Icon }) => (
          <li key={to} className="border-b border-border last:border-b-0">
            <Link
              to={to}
              className="flex min-h-12 items-center gap-3 px-4 py-3 font-body text-sm text-ink hover:bg-lavender/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <Icon size={20} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={18} className="text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** /seller — the seller's home: the shop's status, Available today, basic figures and links to the rest. */
export default function SellerHomePage() {
  return (
    <SellerPage title="Seller home" backTo="/profile">
      {(business) => (
        <>
          <h2 className="font-heading text-2xl font-bold text-ink">{business.name}</h2>
          <SellerStatusBanner business={business} />
          <AvailableTodayCard business={business} />
          <SellerStats />
          <QuickLinks business={business} />
        </>
      )}
    </SellerPage>
  );
}
