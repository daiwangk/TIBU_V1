import { MessageCircle } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { connectedLabel } from '../../lib/savedHelpers';
import { useConnected } from '../../queries/activity';
import ActivityListSkeleton from './ActivityListSkeleton';
import ActivityRow from './ActivityRow';

/** /connected (RequireAuth) — businesses contacted by WhatsApp or Call, newest first. */
export default function ConnectedPage() {
  const { data, isPending, isError, error, refetch } = useConnected();

  let body;
  if (isPending) body = <ActivityListSkeleton label="Loading previously connected" round />;
  else if (isError) body = <ErrorState error={error} onRetry={() => refetch()} />;
  else if (!data?.length) {
    body = (
      <EmptyState
        icon={<MessageCircle size={28} aria-hidden="true" />}
        title="No sellers contacted yet"
        text="Businesses you WhatsApp or call from Tibu will show up here."
        action={{ label: 'Explore Tibu', to: '/' }}
      />
    );
  } else {
    body = (
      <ul className="flex flex-col gap-3">
        {data.map((item) => (
          <ActivityRow
            key={`${item.business.id}-${item.channel}-${item.contactedAt}`}
            to={`/b/${item.business.slug}`}
            imageUrl={item.business.logoUrl}
            title={item.business.name}
            detail={item.business.locality}
            meta={connectedLabel(item.channel, item.contactedAt)}
            round
          />
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Previously connected" fallbackTo="/profile" />
      <main className="px-screen pt-4 pb-8">{body}</main>
    </div>
  );
}
