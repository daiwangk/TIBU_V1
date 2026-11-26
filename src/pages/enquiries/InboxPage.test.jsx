import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import InboxPage from './InboxPage.jsx';

const { data } = vi.hoisted(() => ({ data: { role: 'seller', customer: [], seller: [], shopError: false } }));
vi.mock('../../queries/me.js', () => ({ useMe: () => ({ data: { role: data.role } }) }));
vi.mock('../../queries/enquiries.js', () => ({
  useMyThreads: ({ as = 'customer' }) => ({
    data: data[as], isError: as === 'seller' && data.shopError,
    error: data.shopError ? new Error('Could not refresh') : null,
  }),
}));

const shopThread = { id: 'shop-chat', customerName: 'Asha', lastMessagePreview: 'When can I pick it up?', unreadCount: 1 };
const shoppingThread = { id: 'shopping-chat', businessName: 'Cake Shop', lastMessagePreview: 'Is it available?', lastMessageFromMe: true, unreadCount: 2 };

function render(path = '/enquiries', as = 'customer') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}><InboxPage as={as} /></MemoryRouter>,
  );
}

beforeEach(() => {
  data.role = 'seller';
  data.customer = [];
  data.seller = [shopThread];
  data.shopError = false;
});

describe('Messages inbox', () => {
  it('shows the seller conversation when the profile link arrives with only shop unread', () => {
    const html = render();
    expect(html).toContain('My shop (1)');
    expect(html).toContain('id="tabpanel-shop" aria-labelledby="tab-shop"');
    expect(html).toContain('href="/seller/enquiries/shop-chat"');
    expect(html).not.toContain('No messages yet');
  });

  it('honors the selected tab with unread counts in both places', () => {
    data.customer = [shoppingThread];
    const html = render('/enquiries?tab=shopping');
    expect(html).toContain('My shop (1)');
    expect(html).toContain('Shopping (2)');
    expect(html).toContain('href="/enquiries/shopping-chat"');
    expect(html).toContain('You: Is it available?');
    expect(html).not.toContain('href="/seller/enquiries/shop-chat"');
  });

  it('keeps the seller dashboard shortcut on the shop tab', () => {
    data.seller = [{ ...shopThread, unreadCount: 0 }];
    expect(render('/seller/enquiries', 'seller')).toContain('href="/seller/enquiries/shop-chat"');
  });

  it('shows a single inbox and clear empty copy for a customer', () => {
    data.role = 'customer';
    const html = render('/enquiries?tab=shop');
    expect(html).toContain('No messages yet');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('shop-chat');
  });

  it('offers retry if a stale empty shop list could hide unread messages', () => {
    data.seller = [];
    data.shopError = true;
    const html = render();
    expect(html).toContain('Try again');
    expect(html).not.toContain('No messages yet');
  });
});
