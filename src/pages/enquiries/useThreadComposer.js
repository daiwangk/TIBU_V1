import { useReducer, useRef } from 'react';
import { composerReducer, initialComposer, submitDraft } from './threadState.js';

export default function useThreadComposer({ threadId, as, thread, sendEnquiry, sendMessage }) {
  const scope = `${as}:${threadId}:${Boolean(thread)}`;
  const [state, dispatch] = useReducer(composerReducer, scope, initialComposer);
  const sending = useRef(null);
  if (state.scope !== scope) dispatch({ type: 'reset', scope });
  const current = state.scope === scope ? state : initialComposer(scope);
  const canSend = Boolean(thread) && current.body.trim().length > 0
    && current.body.length <= 2000 && !current.pending;

  async function handleSend(event) {
    event?.preventDefault();
    if (!canSend || sending.current === scope) return;
    sending.current = scope;
    const request = { scope, body: current.body.trim() };
    await submitDraft(request, () => as === 'seller'
      ? sendMessage.mutateAsync({ threadId, body: request.body })
      : sendEnquiry.mutateAsync({
        businessId: thread.businessId, productId: thread.productId ?? null, body: request.body,
      }), dispatch);
    if (sending.current === scope) sending.current = null;
  }

  return {
    body: current.body, isSending: Boolean(current.pending), canSend, handleSend,
    setBody: (body) => dispatch({ type: 'draft', body }),
  };
}
