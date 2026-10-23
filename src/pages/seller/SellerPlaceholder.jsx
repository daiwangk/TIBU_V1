import { Hammer } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

/**
 * Stand-in for a seller screen that a later task builds (B5.1 messages, B5.2 reviews).
 *
 * @param {{ title: string, backTo?: string }} props
 */
export default function SellerPlaceholder({ title, backTo = '/seller' }) {
  return (
    <main className="min-h-svh bg-bg">
      <PageHeader title={title} fallbackTo={backTo} />
      <EmptyState
        icon={<Hammer size={28} aria-hidden="true" />}
        title="Coming soon"
        text="We're still building this part of the seller area."
        action={{ label: 'Back to seller home', to: '/seller' }}
      />
    </main>
  );
}
