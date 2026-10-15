import { beforeEach, describe, expect, it, vi } from 'vitest';

const revealContact = vi.fn();
vi.mock('../services/index.js', () => ({ revealContact: (...args) => revealContact(...args) }));
const toastError = vi.fn();
vi.mock('sonner', () => ({ toast: { error: (...args) => toastError(...args) } }));

const { performContactAction } = await import('./contact.js');

const SITE = 'https://tibu-app.pages.dev';
const product = { id: 'p-123', name: 'Chocolate Chunk Cookies', price: 350 };
const payload = { businessId: 'b-1', businessSlug: 'sweet-crumbs', businessName: 'Sweet Crumbs' };

let location;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('VITE_SITE_URL', `${SITE}/`); // trailing slash must not produce "//p/"
  location = { href: 'about:blank', origin: 'http://localhost' };
  vi.stubGlobal('window', { location });
});

describe('performContactAction (CONTRACT §10)', () => {
  it('opens WhatsApp with the exact product message and /p/ link', async () => {
    revealContact.mockResolvedValue({ phone: '9876543210', whatsapp: '98765 43210' });
    await performContactAction({ type: 'whatsapp', payload: { ...payload, product } });

    expect(revealContact).toHaveBeenCalledWith({ businessId: 'b-1', channel: 'whatsapp', productId: 'p-123' });
    const text = "Hi! I discovered your business through Tibu and I'm interested in your Chocolate Chunk Cookies (₹350). I'd like to know more.\n"
      + `${SITE}/p/p-123`;
    expect(location.href).toBe(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`);
  });

  it('uses the business message and /b/ link without a product', async () => {
    revealContact.mockResolvedValue({ phone: null, whatsapp: '9876543210' });
    await performContactAction({ type: 'whatsapp', payload: { ...payload, product: null } });

    const text = `Hi! I discovered Sweet Crumbs through Tibu and I'd like to know more.\n${SITE}/b/sweet-crumbs`;
    expect(location.href).toBe(`https://wa.me/919876543210?text=${encodeURIComponent(text)}`);
  });

  it('opens the dialler with +91 for Call', async () => {
    revealContact.mockResolvedValue({ phone: '9876543210', whatsapp: null });
    await performContactAction({ type: 'call', payload: { ...payload, product: null } });
    expect(location.href).toBe('tel:+919876543210');
  });

  it('toasts when the seller has no number, without navigating', async () => {
    revealContact.mockResolvedValue({ phone: null, whatsapp: null });
    await performContactAction({ type: 'whatsapp', payload });
    expect(toastError).toHaveBeenCalledWith("This seller hasn't added a WhatsApp number");
    expect(location.href).toBe('about:blank');
  });
});
