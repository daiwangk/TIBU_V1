import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { useMarkThreadRead, useSendEnquiry, useSendMessage } from './enquiries.js';
import { qk } from './keys.js';

const mocks = vi.hoisted(() => ({ sendEnquiry: vi.fn(), sendMessage: vi.fn(), markThreadRead: vi.fn(), client: null }));
vi.mock('../services/index.js', () => ({
  sendEnquiry: mocks.sendEnquiry, sendMessage: mocks.sendMessage, markThreadRead: mocks.markThreadRead,
  findMyThread: vi.fn(), getThread: vi.fn(), listMyThreads: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));
vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...await importOriginal(),
  useQueryClient: () => mocks.client,
  useMutation: (options) => options,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
});
afterEach(() => mocks.client.clear());

function execute(options, variables) {
  return mocks.client.getMutationCache().build(mocks.client, options).execute(variables);
}

describe('send mutation cache lifecycle', () => {
  const cases = [
    { role: 'customer', hook: useSendEnquiry, service: mocks.sendEnquiry,
      payload: { businessId: 'biz-1', body: 'Hello' }, result: 'thread-1' },
    { role: 'seller', hook: useSendMessage, service: mocks.sendMessage,
      payload: { threadId: 'thread-1', body: 'Hello' }, result: { id: 'message-1' } },
  ];
  it.each(cases)('$role invalidates the thread exactly once, only after send resolves; never appends locally', async ({ hook, service, payload, result }) => {
    let resolve;
    service.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const detail = { thread: { id: 'thread-1' }, messages: [] };
    mocks.client.setQueryData(qk.thread('thread-1'), detail);
    const invalidate = vi.spyOn(mocks.client, 'invalidateQueries');
    const pending = execute(hook(), payload);
    await vi.waitFor(() => expect(service).toHaveBeenCalledOnce());
    expect(invalidate).not.toHaveBeenCalled();
    resolve(result);
    await pending;
    expect(invalidate.mock.calls.filter(([filter]) => filter.queryKey[0] === 'thread'))
      .toEqual([[{ queryKey: qk.thread('thread-1') }]]);
    expect(mocks.client.getQueryData(qk.thread('thread-1'))).toEqual(detail);
  });

  it.each(cases)('$role failed send leaves message data unchanged and does not invalidate', async ({ hook, service, payload }) => {
    service.mockRejectedValue(new Error('offline'));
    const invalidate = vi.spyOn(mocks.client, 'invalidateQueries');
    await expect(execute(hook(), payload)).rejects.toThrow('offline');
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('failed thread read preserves inbox and profile unread counts', async () => {
    mocks.client.setQueryData(qk.unread, { enquiries: 2, notifications: 1 });
    mocks.client.setQueryData(qk.threads('customer'), [{ id: 'thread-1', unreadCount: 2 }]);
    mocks.markThreadRead.mockRejectedValue(new Error('offline'));
    await expect(execute(useMarkThreadRead(), 'thread-1')).rejects.toThrow('offline');
    expect(mocks.client.getQueryData(qk.unread).enquiries).toBe(2);
    expect(mocks.client.getQueryData(qk.threads('customer'))[0].unreadCount).toBe(2);
  });
});
