import { beforeEach, describe, expect, it, vi } from 'vitest';
import { markNotificationsRead } from './notifications.js';

const { getSupabase } = vi.hoisted(() => ({ getSupabase: vi.fn() }));
vi.mock('./client.js', () => ({ getSupabase }));
let rows, from, selected, updated, snapshotError, writeError;
beforeEach(() => {
  rows = [{ id: '1', read_at: null }, { id: '2', read_at: null }];
  snapshotError = null;
  writeError = null;
  selected = {
    order: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(async () => ({ data: rows.at(-1) ?? null, error: snapshotError })),
  };
  updated = {
    is: vi.fn().mockReturnThis(),
    lte: vi.fn(async (_column, ceiling) => {
      if (!writeError) rows = rows.map((row) => BigInt(row.id) <= BigInt(ceiling)
        ? { ...row, read_at: 'read' } : row);
      return { error: writeError };
    }),
    in: vi.fn(async () => ({ error: writeError })),
  };
  from = vi.fn(() => ({ select: vi.fn(() => selected), update: vi.fn(() => updated) }));
  getSupabase.mockReturnValue({ from });
});

describe('notification read boundaries', () => {
  it('mark all excludes a notification arriving between the snapshot and write', async () => {
    selected.maybeSingle.mockImplementationOnce(async () => {
      const lastExisting = rows.at(-1);
      rows.push({ id: '3', read_at: null });
      return { data: lastExisting, error: null };
    });
    await markNotificationsRead('all');
    expect(selected.order).toHaveBeenCalledWith('id', { ascending: false });
    expect(selected.limit).toHaveBeenCalledWith(1);
    expect(updated.is).toHaveBeenCalledWith('read_at', null);
    expect(updated.lte).toHaveBeenCalledWith('id', '2');
    expect(rows.map((row) => row.read_at)).toEqual(['read', 'read', null]);
  });

  it('an empty snapshot never falls back to an unbounded write', async () => {
    rows = [];
    await markNotificationsRead('all');
    expect(from).toHaveBeenCalledTimes(1);
    expect(updated.lte).not.toHaveBeenCalled();
  });

  it('snapshot failure rejects without marking anything read', async () => {
    snapshotError = { message: 'permission denied', code: '42501' };
    await expect(markNotificationsRead('all')).rejects.toMatchObject({ code: 'forbidden' });
    expect(updated.lte).not.toHaveBeenCalled();
  });

  it('a failed bounded update rejects so the notification overlay rolls back', async () => {
    writeError = { message: 'permission denied', code: '42501' };
    await expect(markNotificationsRead('all')).rejects.toMatchObject({ code: 'forbidden' });
    expect(rows.every((row) => row.read_at === null)).toBe(true);
  });

  it('individual reads update only the requested IDs without taking an all snapshot', async () => {
    await markNotificationsRead(['2']);
    expect(selected.maybeSingle).not.toHaveBeenCalled();
    expect(updated.in).toHaveBeenCalledWith('id', ['2']);
  });
});
