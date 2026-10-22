import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  findMyThread,
  getThread,
  listMyThreads,
  markThreadRead,
  sendEnquiry,
  sendMessage,
  validateEnquiryBody,
} from './enquiries.js';
import { mapEnquiryMessage, mapEnquiryThread } from './mappers.js';

vi.mock('./client.js', () => ({
  getSupabase: vi.fn(),
}));

const { getSupabase } = await import('./client.js');

describe('validateEnquiryBody()', () => {
  it('accepts valid text and trims whitespace', () => {
    expect(validateEnquiryBody('  Hello there  ')).toBe('Hello there');
  });

  it('rejects empty or whitespace-only body', () => {
    expect(() => validateEnquiryBody('')).toThrowError(/between 1 and 2000 characters/);
    expect(() => validateEnquiryBody('    ')).toThrowError(/between 1 and 2000 characters/);
  });

  it('rejects null or non-string body', () => {
    expect(() => validateEnquiryBody(null)).toThrowError(/between 1 and 2000 characters/);
    expect(() => validateEnquiryBody(undefined)).toThrowError(/between 1 and 2000 characters/);
    expect(() => validateEnquiryBody(123)).toThrowError(/between 1 and 2000 characters/);
  });

  it('rejects bodies longer than 2000 characters after trim', () => {
    const tooLong = 'a'.repeat(2001);
    expect(() => validateEnquiryBody(tooLong)).toThrowError(/between 1 and 2000 characters/);
  });

  it('accepts a body of exactly 2000 characters', () => {
    const exact = 'b'.repeat(2000);
    expect(validateEnquiryBody(exact)).toBe(exact);
  });
});

describe('sendEnquiry()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires a businessId', async () => {
    await expect(sendEnquiry({ businessId: '', body: 'Hi' })).rejects.toMatchObject({
      code: 'validation',
    });
  });

  it('validates body', async () => {
    await expect(sendEnquiry({ businessId: 'biz-1', body: '   ' })).rejects.toMatchObject({
      code: 'validation',
    });
  });

  it('calls send_enquiry RPC and returns the thread id', async () => {
    getSupabase.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: 'thread-123', error: null }),
    });

    const res = await sendEnquiry({
      businessId: 'biz-1',
      productId: 'prod-1',
      body: 'Is this available?',
    });

    expect(res).toBe('thread-123');
    expect(getSupabase().rpc).toHaveBeenCalledWith('send_enquiry', {
      p_business: 'biz-1',
      p_product: 'prod-1',
      p_body: 'Is this available?',
    });
  });

  it('maps cannot_enquire_own_business error to forbidden', async () => {
    getSupabase.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'cannot_enquire_own_business' },
      }),
    });

    await expect(
      sendEnquiry({ businessId: 'biz-1', body: 'Hello' }),
    ).rejects.toMatchObject({
      code: 'forbidden',
      message: "You can't send an enquiry to your own business",
    });
  });

  it('maps rate_limited error', async () => {
    getSupabase.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'rate_limited', code: '53400' },
      }),
    });

    await expect(
      sendEnquiry({ businessId: 'biz-1', body: 'Hello' }),
    ).rejects.toMatchObject({
      code: 'rate_limited',
    });
  });

  it('maps business_not_available error', async () => {
    getSupabase.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'business_not_available' },
      }),
    });

    await expect(
      sendEnquiry({ businessId: 'biz-1', body: 'Hello' }),
    ).rejects.toMatchObject({
      code: 'business_not_available',
    });
  });
});

describe('findMyThread()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null if businessId is empty', async () => {
    expect(await findMyThread('')).toBeNull();
  });

  it('throws auth_required if user is not authenticated', async () => {
    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    });

    await expect(findMyThread('biz-1')).rejects.toMatchObject({
      code: 'auth_required',
    });
  });

  it('queries enquiries table and returns thread id if found', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: { id: 'thread-99' }, error: null });
    const eqCustomer = vi.fn().mockReturnValue({ maybeSingle });
    const eqBusiness = vi.fn().mockReturnValue({ eq: eqCustomer });
    const select = vi.fn().mockReturnValue({ eq: eqBusiness });
    const from = vi.fn().mockReturnValue({ select });

    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }) },
      from,
    });

    const id = await findMyThread('biz-1');
    expect(id).toBe('thread-99');
    expect(from).toHaveBeenCalledWith('enquiries');
    expect(select).toHaveBeenCalledWith('id');
    expect(eqBusiness).toHaveBeenCalledWith('business_id', 'biz-1');
    expect(eqCustomer).toHaveBeenCalledWith('customer_id', 'user-1');
  });

  it('returns null if thread is not found', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqCustomer = vi.fn().mockReturnValue({ maybeSingle });
    const eqBusiness = vi.fn().mockReturnValue({ eq: eqCustomer });
    const select = vi.fn().mockReturnValue({ eq: eqBusiness });
    const from = vi.fn().mockReturnValue({ select });

    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }) },
      from,
    });

    const id = await findMyThread('biz-1');
    expect(id).toBeNull();
  });
});

describe('listMyThreads()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls my_enquiries RPC with default as=customer and maps rows', async () => {
    getSupabase.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            enquiry_id: 't-1',
            business_id: 'b-1',
            business_name: 'Sweet Bakes',
            customer_name: 'Aisha',
            product_id: 'p-1',
            product_name: 'Brownies',
            last_message: 'Is it eggless?',
            last_message_at: '2026-10-22T10:00:00Z',
            unread: 2,
            status: 'open',
          },
        ],
        error: null,
      }),
    });

    const threads = await listMyThreads();
    expect(getSupabase().rpc).toHaveBeenCalledWith('my_enquiries', { p_as: 'customer' });
    expect(threads).toEqual([
      {
        id: 't-1',
        businessId: 'b-1',
        businessName: 'Sweet Bakes',
        customerName: 'Aisha',
        productId: 'p-1',
        productName: 'Brownies',
        status: 'open',
        lastMessageAt: '2026-10-22T10:00:00Z',
        lastMessagePreview: 'Is it eggless?',
        unreadCount: 2,
      },
    ]);
  });

  it('truncates lastMessagePreview to 80 chars', () => {
    const longMsg = 'x'.repeat(120);
    const thread = mapEnquiryThread({
      enquiry_id: 't-1',
      business_id: 'b-1',
      last_message: longMsg,
      status: 'open',
    });
    expect(thread.lastMessagePreview).toBe('x'.repeat(80));
  });
});

describe('getThread()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null if threadId is missing', async () => {
    expect(await getThread('')).toBeNull();
  });

  it('throws auth_required if unauthenticated', async () => {
    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    });

    await expect(getThread('t-1')).rejects.toMatchObject({ code: 'auth_required' });
  });

  it('returns ThreadDetail with customerName populated from my_enquiries', async () => {
    const threadRow = {
      id: 't-1',
      status: 'open',
      product_id: 'p-1',
      businesses: { id: 'b-1', slug: 'sweet-bakes', name: 'Sweet Bakes', logo_url: 'logo.webp' },
      products: { id: 'p-1', name: 'Choco Cake' },
    };

    const messageRows = [
      { id: 1, enquiry_id: 't-1', sender_id: 'cust-1', body: 'Hello', created_at: '2026-10-22T10:00:00Z', read_at: null },
      { id: 2, enquiry_id: 't-1', sender_id: 'seller-1', body: 'Hi Aisha!', created_at: '2026-10-22T10:05:00Z', read_at: null },
    ];

    const rpcRows = [
      {
        enquiry_id: 't-1',
        customer_name: 'Aisha Sharma',
        unread: 1,
        last_message: 'Hi Aisha!',
        last_message_at: '2026-10-22T10:05:00Z',
      },
    ];

    const fromMock = vi.fn((table) => {
      if (table === 'enquiries') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: threadRow, error: null }),
            }),
          }),
        };
      }
      if (table === 'enquiry_messages') {
        return {
          select: () => ({
            eq: () => ({
              order: vi.fn().mockResolvedValue({ data: messageRows, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'cust-1' } } } }) },
      from: fromMock,
      rpc: vi.fn().mockResolvedValue({ data: rpcRows, error: null }),
    });

    const result = await getThread('t-1', { as: 'customer' });
    expect(result).not.toBeNull();
    expect(result.thread.customerName).toBe('Aisha Sharma');
    expect(result.thread.unreadCount).toBe(1);
    expect(result.thread.businessSlug).toBe('sweet-bakes');
    expect(result.messages).toHaveLength(2);
    expect(result.messages[0].fromMe).toBe(true); // cust-1 === uid
    expect(result.messages[1].fromMe).toBe(false); // seller-1 !== uid
  });

  it('returns null when thread row is not visible/found under RLS', async () => {
    const fromMock = vi.fn((table) => {
      if (table === 'enquiries') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () => ({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    });

    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'cust-1' } } } }) },
      from: fromMock,
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const result = await getThread('t-unknown');
    expect(result).toBeNull();
  });
});

describe('sendMessage()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires threadId and body', async () => {
    await expect(sendMessage({ threadId: '', body: 'Hi' })).rejects.toMatchObject({
      code: 'validation',
    });
    await expect(sendMessage({ threadId: 't-1', body: '   ' })).rejects.toMatchObject({
      code: 'validation',
    });
  });

  it('throws auth_required if not logged in', async () => {
    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    });
    await expect(sendMessage({ threadId: 't-1', body: 'Hello' })).rejects.toMatchObject({
      code: 'auth_required',
    });
  });

  it('inserts into enquiry_messages and returns mapped message', async () => {
    const singleMock = vi.fn().mockResolvedValue({
      data: {
        id: 10,
        enquiry_id: 't-1',
        sender_id: 'seller-1',
        body: 'Sure, we can deliver today',
        created_at: '2026-10-22T10:00:00Z',
        read_at: null,
      },
      error: null,
    });
    const selectMock = vi.fn().mockReturnValue({ single: singleMock });
    const insertMock = vi.fn().mockReturnValue({ select: selectMock });
    const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

    getSupabase.mockReturnValue({
      auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'seller-1' } } } }) },
      from: fromMock,
    });

    const msg = await sendMessage({ threadId: 't-1', body: '  Sure, we can deliver today  ' });
    expect(fromMock).toHaveBeenCalledWith('enquiry_messages');
    expect(insertMock).toHaveBeenCalledWith({
      enquiry_id: 't-1',
      sender_id: 'seller-1',
      body: 'Sure, we can deliver today',
    });
    expect(msg).toEqual({
      id: '10',
      threadId: 't-1',
      fromMe: true,
      body: 'Sure, we can deliver today',
      createdAt: '2026-10-22T10:00:00Z',
      readAt: null,
    });
  });
});

describe('markThreadRead()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires threadId', async () => {
    await expect(markThreadRead('')).rejects.toMatchObject({ code: 'validation' });
  });

  it('calls mark_enquiry_read RPC', async () => {
    getSupabase.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    await markThreadRead('t-123');
    expect(getSupabase().rpc).toHaveBeenCalledWith('mark_enquiry_read', {
      p_enquiry: 't-123',
    });
  });
});

describe('mapEnquiryMessage()', () => {
  it('correctly maps row to EnquiryMessage shape', () => {
    const mapped = mapEnquiryMessage(
      {
        id: 42,
        enquiry_id: 'thread-1',
        sender_id: 'uid-abc',
        body: 'Message text',
        created_at: '2026-10-22T11:00:00Z',
        read_at: '2026-10-22T11:05:00Z',
      },
      'uid-abc',
    );

    expect(mapped).toEqual({
      id: '42',
      threadId: 'thread-1',
      fromMe: true,
      body: 'Message text',
      createdAt: '2026-10-22T11:00:00Z',
      readAt: '2026-10-22T11:05:00Z',
    });
  });
});
