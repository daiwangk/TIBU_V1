import { Send } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import IconButton from '../../components/ui/IconButton.jsx';
import { userMessage } from '../../lib/errors.js';

const fieldLayout = 'col-start-1 row-start-1 min-w-0 min-h-11 max-h-32 border px-3.5 py-2.5 font-body text-base leading-6';

export default function ThreadComposer({ body, setBody, isSending, sendError, canSend, handleSend }) {
  return (
    <footer className="shrink-0 border-t border-border bg-surface px-screen py-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
      {isSending && <p role="status" className="mb-2 text-sm text-muted">Sending message…</p>}
      <form onSubmit={handleSend} className="flex flex-col gap-2">
        {sendError && (
          <div className="flex items-center justify-between gap-2">
            <p role="alert" className="text-sm text-error">Couldn’t send. {userMessage(sendError)}</p>
            <Button type="submit" variant="ghost" size="sm" disabled={!canSend}>Retry</Button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="grid min-w-0 flex-1">
            {/* A hidden mirror sizes the textarea even on browsers without field-sizing. */}
            <div aria-hidden="true" className={`${fieldLayout} invisible overflow-hidden whitespace-pre-wrap wrap-anywhere`}>
              {body + ' '}
            </div>
            <textarea
              rows={1}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Type a message…"
              maxLength={2000}
              readOnly={isSending}
              aria-label="Message text"
              className={`${fieldLayout} w-full resize-none overflow-y-auto rounded-btn border-sage bg-bg text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary`}
            />
          </div>
          <IconButton
            type="submit"
            label="Send message"
            disabled={!canSend}
            className={`h-11 w-11 shrink-0 rounded-full ${canSend ? 'bg-primary text-primary-fg' : 'bg-border text-muted'}`}
          >
            <Send size={18} aria-hidden="true" />
          </IconButton>
        </div>
      </form>
    </footer>
  );
}
