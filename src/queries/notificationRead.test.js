import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { notificationReadOptions, pendingReadSnapshot } from './notificationRead.js';
import { qk } from './keys.js';

const { write } = vi.hoisted(() => ({ write: vi.fn() }));
vi.mock('../services/index.js', () => ({ markNotificationsRead: write }));
let client;
const inboxKey = [...qk.notifications, { infinite: true, limit: 20 }];
const unread = (id) => ({ id, readAt: null });
const overlay = () => new Set(client.getMutationCache().getAll().flatMap(pendingReadSnapshot));
function start(ids) {
  const mutation = client.getMutationCache().build(client, notificationReadOptions(client));
  return mutation.execute(ids);
}

beforeEach(() => {
  vi.clearAllMocks();
  client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  client.setQueryData(inboxKey, { pages: [[unread('1')], [unread('2')]], pageParams: [0, 20] });
  client.setQueryData(qk.unread, { notifications: 2, enquiries: 3 });
});
afterEach(() => client.clear());

describe('notification read writes', () => {
  it.each([{ ids: ['1'] }, { ids: 'all' }])('restores unread indicators when $ids fails, without corrupting cached badges', async ({ ids }) => {
    let reject;
    write.mockImplementation(() => new Promise((_, fail) => { reject = fail; }));
    const pending = start(ids).catch(() => {});
    await vi.waitFor(() => expect(write).toHaveBeenCalled());
    expect(overlay()).toEqual(new Set(ids === 'all' ? ['1', '2'] : ids));
    reject(new Error('offline'));
    await pending;
    expect(overlay().size).toBe(0);
    expect(client.getQueryData(inboxKey).pages.flat().every((item) => !item.readAt)).toBe(true);
    expect(client.getQueryData(qk.unread)).toEqual({ notifications: 2, enquiries: 3 });
  });

  it('a notification arriving after mark all read stays unread, during and after the write', async () => {
    let resolve;
    write.mockImplementation(() => new Promise((done) => { resolve = done; }));
    const pending = start('all');
    await vi.waitFor(() => expect(write).toHaveBeenCalledWith('all'));
    client.setQueryData(inboxKey, (data) => ({ ...data, pages: [[unread('new'), ...data.pages[0]], data.pages[1]] }));
    expect(overlay().has('new')).toBe(false);
    resolve();
    await pending;
    expect(overlay().size).toBe(0);
    expect(client.getQueryData(inboxKey).pages[0][0].readAt).toBeNull();
    expect(client.getQueryState(inboxKey).isInvalidated).toBe(true);
    expect(client.getQueryState(qk.unread).isInvalidated).toBe(true);
  });

  it('overlapping reads roll back independently', async () => {
    let failFirst, finishSecond;
    write.mockImplementationOnce(() => new Promise((_, fail) => { failFirst = fail; }))
      .mockImplementationOnce(() => new Promise((done) => { finishSecond = done; }));
    const first = start(['1']).catch(() => {});
    const second = start(['2']);
    await vi.waitFor(() => expect(write).toHaveBeenCalledTimes(2));
    failFirst(new Error('offline'));
    await first;
    expect(overlay()).toEqual(new Set(['2']));
    finishSecond();
    await second;
    expect(overlay().size).toBe(0);
  });
});
