import { useEffect, useRef } from 'react';
import { ArrowDown, ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import useAppBack from '../../lib/useAppBack.js';
import { useMarkThreadRead, useSendEnquiry, useSendMessage, useThread } from '../../queries/enquiries.js';
import MessageBubble from './MessageBubble.jsx';
import ThreadComposer from './ThreadComposer.jsx';
import useThreadComposer from './useThreadComposer.js';
import useThreadViewport from './useThreadViewport.js';
import { uniqueMessages } from './threadState.js';

function ThreadSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4" role="status" aria-label="Loading messages">
      <Skeleton className="h-10 w-2/3 self-start rounded-2xl rounded-tl-sm" />
      <Skeleton className="h-14 w-3/4 self-end rounded-2xl rounded-tr-sm" />
      <Skeleton className="h-12 w-1/2 self-start rounded-2xl rounded-tl-sm" />
    </div>
  );
}

/**
 * Thread detail conversation screen. Reused for customer and seller views.
 *
 * @param {{ as?: 'customer' | 'seller' }} props
 */
export default function ThreadPage({ as = 'customer' }) {
  const { threadId } = useParams();
  return <Conversation key={`${as}:${threadId}`} as={as} threadId={threadId} />;
}

function Conversation({ as, threadId }) {
  const isSeller = as === 'seller';
  const fallbackRoute = isSeller ? '/seller/enquiries' : '/enquiries';
  const handleBack = useAppBack(fallbackRoute);
  const { data, dataUpdatedAt, isLoading, isError, isRefetchError, error, refetch, isRefetching } = useThread(threadId, { as });
  const { mutate: markRead, isPending: markingRead } = useMarkThreadRead();
  const sendEnquiry = useSendEnquiry();
  const sendMessage = useSendMessage();

  const thread = data?.thread;
  const messages = uniqueMessages(thread ? data.messages : []);
  const composer = useThreadComposer({
    threadId, as, thread, sendEnquiry, sendMessage,
  });
  const { viewportRef, messagesRef, onScroll, following, hasNewMessages, jumpToLatest } =
    useThreadViewport(messages.at(-1)?.id);
  const lastReadAttempt = useRef(null);
  const blockingError = isError && !(isRefetchError && thread);

  // Only clear new unread messages when the reader is following the latest replies.
  const unreadCount = thread?.unreadCount ?? 0;
  useEffect(() => {
    if (threadId && unreadCount > 0 && following && !document.hidden && !isError && !isRefetching && !markingRead
      && lastReadAttempt.current !== dataUpdatedAt) {
      lastReadAttempt.current = dataUpdatedAt;
      markRead(threadId);
    }
  }, [threadId, unreadCount, following, isError, isRefetching, markingRead, dataUpdatedAt, markRead]);

  return (
    <div ref={viewportRef} className="flex h-[calc(var(--chat-height,100dvh)-env(safe-area-inset-top))] min-h-0 flex-col overflow-hidden bg-bg">
      <header className="z-20 flex shrink-0 flex-col border-b border-border bg-surface">
        <div className="flex min-h-14 items-center gap-2 px-3">
          <IconButton label="Back" onClick={handleBack}>
            <ArrowLeft size={20} aria-hidden="true" />
          </IconButton>

          <div className="min-w-0 flex-1">
            {isSeller ? (
              <h1 className="truncate font-heading text-base font-bold text-ink">
                {thread?.customerName || 'Customer'}
              </h1>
            ) : thread?.businessSlug ? (
              <Link
                to={`/b/${thread.businessSlug}`}
                className="inline-block truncate font-heading text-base font-bold text-ink hover:underline"
              >
                {thread.businessName}
              </Link>
            ) : (
              <h1 className="truncate font-heading text-base font-bold text-ink">
                {thread?.businessName || 'Business'}
              </h1>
            )}
          </div>

          <IconButton
            label="Refresh conversation"
            onClick={() => refetch()}
            disabled={isRefetching}
            className={isRefetching ? 'animate-spin text-primary' : ''}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </IconButton>
        </div>

        {thread?.productName && thread?.productId && (
          <Link
            to={`/p/${thread.productId}`}
            aria-label={`View product: ${thread.productName}`}
            className="flex min-h-11 items-center gap-2 border-t border-border bg-bg px-screen text-sm text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <span className="shrink-0 text-xs text-muted">Product</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{thread.productName}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        )}
      </header>

      <main ref={messagesRef} tabIndex={0} aria-label="Conversation" onScroll={onScroll}
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-screen py-4 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary">
        {isLoading && <ThreadSkeleton />}

        {blockingError && (
          <div className="py-6">
            <ErrorState error={error} onRetry={() => refetch()} />
          </div>
        )}

        {!blockingError && isRefetchError && thread && (
          <div className="mb-2 flex items-center justify-between gap-2 rounded-card bg-surface px-3">
            <p role="status" className="text-sm text-error">Couldn’t refresh messages.</p>
            <Button type="button" variant="ghost" size="sm" onClick={() => refetch()} disabled={isRefetching}>Retry</Button>
          </div>
        )}

        {!isLoading && !blockingError && !thread && (
          <EmptyState title="Conversation unavailable" text="This conversation is no longer available."
            action={{ label: 'Back to messages', to: fallbackRoute, replace: true }} />
        )}

        {!isLoading && !blockingError && thread && messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            <p className="font-heading text-sm font-semibold text-ink">No messages yet</p>
            <p className="mt-1 font-body text-xs text-muted">Send a message below to start the conversation.</p>
          </div>
        )}

        {!isLoading && !blockingError && messages.length > 0 && (
          <div className="flex flex-col gap-3">
            {messages.map((msg, index) => {
              const prevDate = messages[index - 1]?.createdAt?.slice(0, 10);
              const curDate = msg.createdAt?.slice(0, 10);
              const showDay = index === 0 || prevDate !== curDate;

              return <MessageBubble key={msg.id} msg={msg} showDay={showDay} />;
            })}

            <div className="my-3 text-center">
              <span className="rounded-full bg-lavender/60 px-3 py-1 font-body text-[11px] text-body">
                Replies appear here — we&apos;ll notify you.
              </span>
            </div>

          </div>
        )}
      </main>

      <div className="relative shrink-0">
        {hasNewMessages && !blockingError && (
          <div role="status" className="pointer-events-none absolute inset-x-0 bottom-full z-10 flex justify-center pb-2">
            <Button type="button" size="sm" variant="secondary" onClick={jumpToLatest} className="pointer-events-auto gap-1 shadow-sm">
              New messages <ArrowDown size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
        {thread && !blockingError && <ThreadComposer {...composer} />}
      </div>
    </div>
  );
}
