import { describe, expect, it, vi } from 'vitest';
import { composerReducer, initialComposer, submitDraft, uniqueMessages } from './threadState.js';

function composer(scope = 'customer:thread-1:true') {
  let state = composerReducer(initialComposer(scope), { type: 'draft', body: '  Please keep my draft  ' });
  return { get state() { return state; }, dispatch: (action) => { state = composerReducer(state, action); } };
}

describe('conversation send lifecycle', () => {
  it('deduplicates by ID without merging distinct messages with identical text/timestamps', () => {
    const message = { id: '1', body: 'Hello', createdAt: '2026-11-08T10:00:00Z' };
    const other = { ...message, id: '2' };
    expect(uniqueMessages([message, other, { ...message }])).toEqual([message, other]);
  });

  it('keeps pending sends separate and preserves the exact draft on failure', async () => {
    const model = composer();
    let reject;
    const send = vi.fn(() => new Promise((_, fail) => { reject = fail; }));
    const request = { body: model.state.body.trim() };
    const pending = submitDraft(request, send, model.dispatch);
    expect(model.state.pending).toBe(request);
    expect(model.state.body).toBe('  Please keep my draft  ');
    expect(uniqueMessages([])).toEqual([]);
    reject(new Error('offline'));
    await pending;
    expect(model.state.pending).toBeNull();
    expect(model.state.body).toBe('  Please keep my draft  ');
  });

  it.each(['thread-1', { id: 'message-1' }])('clears the draft after success without appending the returned value %j', async (result) => {
    const model = composer();
    await submitDraft({ body: model.state.body }, () => Promise.resolve(result), model.dispatch);
    expect(model.state).toEqual(initialComposer('customer:thread-1:true'));
  });

  it.each(['customer:thread-1:false', 'seller:thread-2:true'])('clears unavailable/changed thread state and ignores a late send: %s', async (scope) => {
    const model = composer();
    let resolve;
    const pending = submitDraft({}, () => new Promise((done) => { resolve = done; }), model.dispatch);
    model.dispatch({ type: 'reset', scope });
    expect(model.state).toEqual(initialComposer(scope));
    model.dispatch({ type: 'draft', body: 'Different thread draft' });
    resolve({ id: 'old-message' });
    await pending;
    expect(model.state.body).toBe('Different thread draft');
    expect(model.state.pending).toBeNull();
  });
});
