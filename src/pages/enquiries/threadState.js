/** Only persisted messages belong in the conversation; pending sends are separate. */
export function uniqueMessages(messages = []) {
  return [...new Map(messages.map((message) => [message.id, message])).values()];
}

export function initialComposer(scope) {
  return { scope, body: '', pending: null };
}

export function composerReducer(state, action) {
  if (action.type === 'reset') return initialComposer(action.scope);
  if (action.type === 'draft') return { ...state, body: action.body };
  if (action.type === 'sending') return { ...state, pending: action.request };
  // A late response from an old thread must never clear another thread's draft.
  if (state.pending !== action.request) return state;
  if (action.type === 'sent') return { ...state, body: '', pending: null };
  if (action.type === 'failed') return { ...state, pending: null };
  return state;
}

/** Shared by customer and seller composers; mutation hooks own cache refresh/errors. */
export async function submitDraft(request, send, dispatch) {
  dispatch({ type: 'sending', request });
  try {
    await send();
    dispatch({ type: 'sent', request });
  } catch {
    dispatch({ type: 'failed', request });
  }
}
