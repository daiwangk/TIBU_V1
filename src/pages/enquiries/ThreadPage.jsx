import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, Send } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import Skeleton from '../../components/ui/Skeleton.jsx';
import { useMarkThreadRead, useSendEnquiry, useSendMessage, useThread } from '../../queries/enquiries.js';
import MessageBubble from './MessageBubble.jsx';

const MAX_BODY_LENGTH = 2000;

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
  const isSeller = as === 'seller';
  const navigate = useNavigate();
  const textareaId = useId();

  const { data, isLoading, isError, error, refetch, isRefetching } = useThread(threadId, { as });
  const markRead = useMarkThreadRead();
  const sendEnquiry = useSendEnquiry();
  const sendMessage = useSendMessage();

  const [body, setBody] = useState('');
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const thread = data?.thread;
  const serverMessages = data?.messages ?? [];

  // Combine server messages with any optimistic messages not yet settled
  const messages = [
    ...serverMessages,
    ...optimisticMessages.filter(
      (opt) => !serverMessages.some((msg) => msg.id === opt.id || msg.createdAt === opt.createdAt),
    ),
  ];

  // Mark thread as read on open or when unreadCount > 0
  const unreadCount = thread?.unreadCount ?? 0;
  useEffect(() => {
    if (threadId && unreadCount > 0) {
      markRead.mutate(threadId);
    }
  }, [threadId, unreadCount, markRead]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const fallbackRoute = isSeller ? '/seller/enquiries' : '/enquiries';
  const isSending = sendEnquiry.isPending || sendMessage.isPending;
  const trimmed = body.trim();
  const canSend = trimmed.length > 0 && body.length <= MAX_BODY_LENGTH && !isSending;

  async function handleSend(e) {
    e?.preventDefault();
    if (!canSend || !thread) return;

    const optimisticId = `opt-${Date.now()}`;
    const newMsg = {
      id: optimisticId,
      threadId,
      fromMe: true,
      body: trimmed,
      createdAt: new Date().toISOString(),
      readAt: null,
      isOptimistic: true,
    };

    setOptimisticMessages((prev) => [...prev, newMsg]);
    setBody('');

    try {
      if (isSeller) {
        await sendMessage.mutateAsync({ threadId, body: trimmed });
      } else {
        await sendEnquiry.mutateAsync({
          businessId: thread.businessId,
          productId: thread.productId ?? null,
          body: trimmed,
        });
      }
    } catch {
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    }
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <header className="sticky top-0 z-20 flex flex-col border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="flex min-h-14 items-center gap-2 px-3">
          <IconButton label="Back" onClick={() => navigate(fallbackRoute)}>
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
          <div className="border-t border-border/60 px-4 py-2 bg-bg/40 flex items-center justify-between">
            <span className="font-body text-xs text-muted">Enquiry about:</span>
            <Link to={`/p/${thread.productId}`}>
              <Badge variant="neutral" className="truncate max-w-[240px]">
                {thread.productName}
              </Badge>
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-screen py-4 overscroll-contain">
        {isLoading && <ThreadSkeleton />}

        {isError && (
          <div className="py-6">
            <ErrorState error={error} onRetry={() => refetch()} />
          </div>
        )}

        {!isLoading && !isError && messages.length === 0 && (
          <div className="py-12 text-center">
            <p className="font-heading text-sm font-semibold text-ink">No messages yet</p>
            <p className="mt-1 font-body text-xs text-muted">Send a message below to start the conversation.</p>
          </div>
        )}

        {!isLoading && !isError && messages.length > 0 && (
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

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-surface px-screen py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              id={textareaId}
              rows={1}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type a message..."
              maxLength={MAX_BODY_LENGTH}
              disabled={isSending}
              aria-label="Message text"
              className="w-full resize-none rounded-btn border border-sage bg-bg px-3.5 py-2.5 font-body text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 max-h-32 min-h-11"
            />
          </div>

          <IconButton
            type="submit"
            label="Send message"
            disabled={!canSend}
            className={`h-11 w-11 shrink-0 rounded-full transition-colors ${
              canSend
                ? 'bg-primary text-primary-fg hover:bg-primary/90'
                : 'bg-border text-muted cursor-not-allowed'
            }`}
          >
            <Send size={18} aria-hidden="true" />
          </IconButton>
        </form>
      </footer>
    </div>
  );
}
