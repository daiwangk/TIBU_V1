import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSupabaseMock } = vi.hoisted(() => ({ getSupabaseMock: vi.fn() }));

vi.mock('./client.js', () => ({ getSupabase: getSupabaseMock }));

import { listConnected, listRecent, trackView } from './activity.js';

describe('activity adapter', () => {
  let rpc;
  let from;

  beforeEach(() => {
    rpc = vi.fn(async () => ({ data: null, error: null }));
    from = vi.fn();
    getSupabaseMock.mockReturnValue({ rpc, from });
  });

  describe('trackView', () => {
    it('calls track_view RPC with p_business for business views', async () => {
      await trackView({ kind: 'business', id: 'biz-uuid-1' });
      expect(rpc).toHaveBeenCalledWith('track_view', { p_business: 'biz-uuid-1' });
    });

    it('calls track_view RPC with p_product for product views', async () => {
      await trackView({ kind: 'product', id: 'prod-uuid-1' });
      expect(rpc).toHaveBeenCalledWith('track_view', { p_product: 'prod-uuid-1' });
    });

    it('does not throw when RPC throws an error', async () => {
      rpc.mockRejectedValueOnce(new Error('Network failure'));
      await expect(trackView({ kind: 'business', id: 'b1' })).resolves.toBeUndefined();
    });
  });

  describe('listRecent', () => {
    it('queries recent_views, maps businesses and products, converts price to rupees', async () => {
      const mockRows = [
        {
          viewed_at: '2026-10-15T10:00:00Z',
          business_id: 'biz-uuid-1',
          product_id: null,
          businesses: {
            id: 'biz-uuid-1',
            slug: 'sita-pottery',
            name: 'Sita Pottery',
            logo_url: 'https://img.test/logo.png',
            locality: 'Indiranagar',
          },
          products: null,
        },
        {
          viewed_at: '2026-10-15T09:00:00Z',
          business_id: null,
          product_id: 'prod-uuid-1',
          businesses: null,
          products: {
            id: 'prod-uuid-1',
            name: 'Terracotta Vase',
            price_paise: 125000,
            product_images: [
              { url: 'https://img.test/vase-2.png', sort_order: 1 },
              { url: 'https://img.test/vase-1.png', sort_order: 0 },
            ],
          },
        },
        {
          // Deleted business (null embed)
          viewed_at: '2026-10-15T08:00:00Z',
          business_id: 'biz-deleted',
          product_id: null,
          businesses: null,
          products: null,
        },
      ];

      const limitMock = vi.fn().mockResolvedValue({ data: mockRows, error: null });
      const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      from.mockReturnValue({ select: selectMock });

      const items = await listRecent({ limit: 10 });

      expect(from).toHaveBeenCalledWith('recent_views');
      expect(orderMock).toHaveBeenCalledWith('viewed_at', { ascending: false });
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(items).toEqual([
        {
          kind: 'business',
          viewedAt: '2026-10-15T10:00:00Z',
          business: {
            id: 'biz-uuid-1',
            slug: 'sita-pottery',
            name: 'Sita Pottery',
            logoUrl: 'https://img.test/logo.png',
            locality: 'Indiranagar',
          },
        },
        {
          kind: 'product',
          viewedAt: '2026-10-15T09:00:00Z',
          product: {
            id: 'prod-uuid-1',
            name: 'Terracotta Vase',
            price: 1250,
            imageUrl: 'https://img.test/vase-1.png',
          },
        },
      ]);
    });
  });

  describe('listConnected', () => {
    it('calls my_connected_businesses RPC and maps result', async () => {
      rpc.mockResolvedValueOnce({
        data: [
          {
            business_id: 'b1',
            slug: 'b1-slug',
            name: 'B1 Name',
            logo_url: null,
            locality: 'Koramangala',
            last_channel: 'whatsapp',
            last_contacted_at: '2026-10-15T12:00:00Z',
          },
        ],
        error: null,
      });

      const items = await listConnected({ limit: 5 });

      expect(rpc).toHaveBeenCalledWith('my_connected_businesses', { p_limit: 5 });
      expect(items).toEqual([
        {
          channel: 'whatsapp',
          contactedAt: '2026-10-15T12:00:00Z',
          business: {
            id: 'b1',
            slug: 'b1-slug',
            name: 'B1 Name',
            logoUrl: null,
            locality: 'Koramangala',
          },
        },
      ]);
    });
  });
});
