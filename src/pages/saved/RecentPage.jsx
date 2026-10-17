import { History } from 'lucide-react';
import Price from '../../components/Price';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import PageHeader from '../../components/ui/PageHeader';
import { viewedLabel } from '../../lib/savedHelpers';
import { useRecent } from '../../queries/activity';
import { useAuthStore } from '../../stores/auth';
import ActivityListSkeleton from './ActivityListSkeleton';
import ActivityRow from './ActivityRow';

/** /recent — signed in: from the server; guests: views kept in this browser (moved to the account on login). */
export default function RecentPage() {
  const status = useAuthStore((s) => s.status);
  const { data, isPending, isError, error, refetch } = useRecent();

  let body;
  if (status === 'loading' || isPending) body = <ActivityListSkeleton label="Loading recently viewed" />;
  else if (isError) body = <ErrorState error={error} onRetry={() => refetch()} />;
  else if (!data?.length) {
    body = (
      <EmptyState
        icon={<History size={28} aria-hidden="true" />}
        title="Nothing viewed yet"
        text="Products and businesses you open will show up here."
        action={{ label: 'Explore Tibu', to: '/' }}
      />
    );
  } else {
    body = (
      <ul className="flex flex-col gap-3">
        {data.map((item) =>
          item.kind === 'product' ? (
            <ActivityRow
              key={`p-${item.product.id}`}
              to={`/p/${item.product.id}`}
              imageUrl={item.product.imageUrl}
              title={item.product.name}
              detail={<Price value={item.product.price} size="sm" />}
              meta={viewedLabel(item.viewedAt)}
            />
          ) : (
            <ActivityRow
              key={`b-${item.business.id}`}
              to={`/b/${item.business.slug}`}
              imageUrl={item.business.logoUrl}
              title={item.business.name}
              detail={item.business.locality}
              meta={viewedLabel(item.viewedAt)}
              round
            />
          ),
        )}
      </ul>
    );
  }

  return (
    <div className="min-h-svh bg-bg">
      <PageHeader title="Recently viewed" fallbackTo="/profile" />
      <main className="px-screen pt-4 pb-8">
        {status === 'guest' && data?.length > 0 && (
          <p className="mb-3 font-body text-xs text-muted">Saved on this device. Log in to keep them with your account.</p>
        )}
        {body}
      </main>
    </div>
  );
}
