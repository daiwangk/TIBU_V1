import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import NotificationRow from './NotificationRow';
import { groupNotificationsByDay } from './notificationsModel';
import { useNotifications, useMarkNotificationsRead } from '../../queries/notifications';
import { listNotifications } from '../../services/index.js';
import { qk } from '../../queries/keys.js';

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [extraBatches, setExtraBatches] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const [allMarkedRead, setAllMarkedRead] = useState(false);

  const { data: initialData = [], isPending, isError, refetch } = useNotifications({
    limit: PAGE_SIZE,
    offset: 0,
  });

  const markReadMutation = useMarkNotificationsRead();

  // Combine initial batch with any loaded extra batches, deduplicated
  const rawItems = [...initialData, ...extraBatches];
  const seen = new Set();
  const items = rawItems
    .filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    })
    .map((item) => ({
      ...item,
      readAt:
        allMarkedRead || readIds.has(item.id)
          ? item.readAt ?? new Date().toISOString()
          : item.readAt,
    }));

  const hasUnread = items.some((item) => !item.readAt);

  const handleMarkAllRead = () => {
    setAllMarkedRead(true);
    markReadMutation.mutate('all');
  };

  const handleTapItem = (item) => {
    if (!item.readAt) {
      setReadIds((prev) => new Set(prev).add(item.id));
      markReadMutation.mutate([item.id]);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleLoadMore = async () => {
    setIsFetchingMore(true);
    try {
      const nextOffset = PAGE_SIZE + extraBatches.length;
      const nextBatch = await queryClient.fetchQuery({
        queryKey: [...qk.notifications, { limit: PAGE_SIZE, offset: nextOffset }],
        queryFn: () => listNotifications({ limit: PAGE_SIZE, offset: nextOffset }),
      });
      if (!nextBatch || nextBatch.length < PAGE_SIZE) {
        setHasReachedEnd(true);
      }
      if (nextBatch && nextBatch.length > 0) {
        setExtraBatches((prev) => [...prev, ...nextBatch]);
      }
    } finally {
      setIsFetchingMore(false);
    }
  };

  const { today, earlier } = groupNotificationsByDay(items);
  const canLoadMore = !hasReachedEnd && initialData.length === PAGE_SIZE;

  const headerActions = (
    <Button
      variant="ghost"
      size="sm"
      disabled={markReadMutation.isPending || !hasUnread}
      onClick={handleMarkAllRead}
      className="text-xs"
    >
      Mark all as read
    </Button>
  );

  return (
    <div className="min-h-screen bg-bg pb-12">
      <PageHeader title="Notifications" fallbackTo="/" actions={headerActions} />

      <main className="px-screen pt-4">
        {isPending && items.length === 0 && (
          <div className="flex flex-col gap-3" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-card border border-border bg-surface p-4">
                <Skeleton variant="circle" size="md" />
                <div className="flex-1">
                  <Skeleton variant="text" lines={2} />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && items.length === 0 && (
          <ErrorState
            message="We couldn't load your notifications. Please try again."
            onRetry={() => refetch()}
          />
        )}

        {!isPending && !isError && items.length === 0 && (
          <EmptyState
            icon={<Bell size={32} strokeWidth={1.75} aria-hidden="true" />}
            title="No notifications yet"
            text="Updates about your enquiries, reviews and shop will show up here."
          />
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-6">
            {today.length > 0 && (
              <section aria-labelledby="today-heading">
                <h2
                  id="today-heading"
                  className="mb-2 px-1 font-heading text-xs font-bold uppercase tracking-wider text-muted"
                >
                  Today
                </h2>
                <div className="flex flex-col gap-2">
                  {today.map((item) => (
                    <NotificationRow key={item.id} item={item} onTap={handleTapItem} />
                  ))}
                </div>
              </section>
            )}

            {earlier.length > 0 && (
              <section aria-labelledby="earlier-heading">
                <h2
                  id="earlier-heading"
                  className="mb-2 px-1 font-heading text-xs font-bold uppercase tracking-wider text-muted"
                >
                  Earlier
                </h2>
                <div className="flex flex-col gap-2">
                  {earlier.map((item) => (
                    <NotificationRow key={item.id} item={item} onTap={handleTapItem} />
                  ))}
                </div>
              </section>
            )}

            {canLoadMore && (
              <div className="mt-2 flex justify-center">
                <Button
                  variant="secondary"
                  disabled={isFetchingMore}
                  loading={isFetchingMore}
                  onClick={handleLoadMore}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
