import { useEffect } from 'react';
import { MessageSquareDashed, RefreshCw } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../../components/ui/Avatar.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { formatRelativeTime } from '../../lib/format.js';
import { useMyThreads } from '../../queries/enquiries.js';
import { useMe } from '../../queries/me.js';

function inboxTabLabel(label, threads = []) {
  const unread = threads.reduce((count, thread) => count + (thread.unreadCount ?? 0), 0);
  return unread ? `${label} (${unread > 99 ? '99+' : unread})` : label;
}

function withTab(tab) {
  return (current) => {
    const next = new URLSearchParams(current);
    next.set('tab', tab);
    return next;
  };
}

function InboxSkeleton() {
  return (
    <ul className="flex flex-col divide-y divide-border" role="status" aria-label="Loading messages">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className="flex items-center gap-3 px-screen py-4">
          <Skeleton variant="circle" size="md" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Message inbox listing enquiry threads for either customer or seller.
 *
 * @param {{ as?: 'customer' | 'seller' }} props
 */
export default function InboxPage({ as = 'customer' }) {
  const [params, setParams] = useSearchParams();
  const profile = useMe();
  const hasShopTab = as === 'seller' || profile.data?.role === 'seller';
  const shopping = useMyThreads({ poll: true });
  const shop = useMyThreads({ as: 'seller', enabled: hasShopTab, poll: true });
  const requestedTab = params.get('tab');
  const explicitTab = requestedTab === 'shopping' || requestedTab === 'shop';
  const preferShop = as === 'seller' || (hasShopTab && shop.data?.some((thread) => thread.unreadCount > 0));
  const defaultTab = preferShop ? 'shop' : 'shopping';
  const tab = hasShopTab && explicitTab ? requestedTab : defaultTab;
  const isSeller = tab === 'shop';
  const inbox = isSeller ? shop : shopping;
  const threads = inbox.data;
  const waitingForShop = hasShopTab && !explicitTab && as !== 'seller' && (shop.isPending || shop.isFetching);
  const isLoading = (as !== 'seller' && profile.isPending) || waitingForShop || inbox.isPending;
  const initialShopError = hasShopTab && !explicitTab && shop.isError && as !== 'seller';
  const failed = profile.isError && !profile.data && as !== 'seller' ? profile : initialShopError ? shop : inbox;
  const isError = !isLoading && failed.isError;

  useEffect(() => {
    // Pin the chosen tab so polling can't move the user while they browse.
    if (hasShopTab && !explicitTab && !waitingForShop && !initialShopError) {
      setParams(withTab(defaultTab), { replace: true });
    }
  }, [hasShopTab, explicitTab, waitingForShop, initialShopError, defaultTab, setParams]);

  return (
    <div className="min-h-screen bg-bg">
      <PageHeader title="Messages" fallbackTo={as === 'seller' ? '/seller' : '/profile'} actions={
        <IconButton label="Refresh messages" onClick={() => failed.refetch()} disabled={isLoading || failed.isRefetching}>
          <RefreshCw size={18} aria-hidden="true" />
        </IconButton>
      } />

      {hasShopTab && (
        <Tabs
          className="bg-surface px-screen"
          label="Messages"
          value={tab}
          items={[
            { value: 'shopping', label: inboxTabLabel('Shopping', shopping.data) },
            { value: 'shop', label: inboxTabLabel('My shop', shop.data) },
          ]}
          onChange={(value) => setParams(withTab(value), { replace: true })}
        />
      )}
      <main className="pb-8">
        {hasShopTab && <div hidden role="tabpanel" id={`tabpanel-${isSeller ? 'shopping' : 'shop'}`} aria-labelledby={`tab-${isSeller ? 'shopping' : 'shop'}`} />}
        <section {...(hasShopTab ? { role: 'tabpanel', id: `tabpanel-${tab}`, 'aria-labelledby': `tab-${tab}` } : {})}>
        {isLoading && <InboxSkeleton />}

        {isError && (
          <div className="py-6">
            <ErrorState error={failed.error} onRetry={() => failed.refetch()} />
          </div>
        )}

        {!isLoading && !isError && threads && threads.length === 0 && (
          <EmptyState
            icon={<MessageSquareDashed size={32} aria-hidden="true" />}
            title={isSeller ? 'No customer messages yet' : 'No messages yet'}
            text={
              isSeller
                ? 'Messages from shoppers about your shop or products will appear here.'
                : 'Chat with local businesses to ask questions or confirm details about your orders.'
            }
            action={{
              label: isSeller ? 'Back to seller home' : 'Explore businesses',
              to: isSeller ? '/seller' : '/',
            }}
          />
        )}

        {!isLoading && threads?.length > 0 && (
          <ul className="divide-y divide-border border-b border-border bg-surface">
            {threads.map((thread) => {
              const to = isSeller ? `/seller/enquiries/${thread.id}` : `/enquiries/${thread.id}`;
              const displayName = isSeller ? thread.customerName : thread.businessName;
              const hasUnread = (thread.unreadCount ?? 0) > 0;

              return (
                <li key={thread.id}>
                  <Link
                    to={to}
                    className="flex min-h-[72px] items-start gap-3 px-screen py-3.5 hover:bg-lavender/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary motion-safe:transition-colors"
                  >
                    <Avatar
                      src={isSeller ? null : thread.businessLogoUrl}
                      name={displayName}
                      size={44}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`truncate font-body text-sm ${
                            hasUnread ? 'font-bold text-ink' : 'font-semibold text-ink'
                          }`}
                        >
                          {displayName}
                        </span>
                        {thread.lastMessageAt && (
                          <span className="shrink-0 font-body text-xs text-muted">
                            {formatRelativeTime(thread.lastMessageAt)}
                          </span>
                        )}
                      </div>

                      {thread.productName && (
                        <div className="mt-1">
                          <Badge variant="neutral" className="truncate max-w-[220px]">
                            {thread.productName}
                          </Badge>
                        </div>
                      )}

                      <p
                        className={`mt-1 line-clamp-1 font-body text-xs ${
                          hasUnread ? 'font-semibold text-ink' : 'text-body'
                        }`}
                      >
                        {thread.lastMessageFromMe && thread.lastMessagePreview ? 'You: ' : ''}
                        {thread.lastMessagePreview || 'No messages yet'}
                      </p>
                    </div>

                    {hasUnread && (
                      <span
                        className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-error"
                        aria-label="Unread message"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        </section>
      </main>
    </div>
  );
}
