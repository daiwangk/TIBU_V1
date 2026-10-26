import { Check } from 'lucide-react';

function formatDayLabel(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - messageDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatMessageTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Message bubble with optional day separator header.
 *
 * @param {{
 *   msg: { id: string, fromMe: boolean, body: string, createdAt: string, isOptimistic?: boolean },
 *   showDay: boolean,
 * }} props
 */
export default function MessageBubble({ msg, showDay }) {
  return (
    <div className="flex flex-col gap-2">
      {showDay && (
        <div className="my-2 flex justify-center">
          <span className="rounded-full bg-surface px-3 py-1 font-body text-[11px] font-medium text-muted shadow-xs border border-border">
            {formatDayLabel(msg.createdAt)}
          </span>
        </div>
      )}

      <div
        className={`flex flex-col max-w-[82%] ${
          msg.fromMe ? 'self-end items-end' : 'self-start items-start'
        }`}
      >
        <div
          className={`px-3.5 py-2.5 shadow-xs font-body text-sm leading-relaxed whitespace-pre-wrap break-words ${
            msg.fromMe
              ? 'bg-primary text-primary-fg rounded-2xl rounded-tr-xs'
              : 'bg-surface text-ink border border-border rounded-2xl rounded-tl-xs'
          }`}
        >
          {msg.body}
        </div>

        <div className="mt-1 flex items-center gap-1 px-1">
          <span className="font-body text-[10px] text-muted">
            {formatMessageTime(msg.createdAt)}
          </span>
          {msg.fromMe && (
            <span
              className={`flex items-center text-[10px] ${
                msg.isOptimistic ? 'text-muted' : 'text-primary'
              }`}
            >
              <Check size={12} aria-hidden="true" />
              {msg.isOptimistic ? 'Sending' : 'Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
