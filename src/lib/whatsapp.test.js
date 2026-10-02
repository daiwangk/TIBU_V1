import { describe, expect, it } from 'vitest';
import {
  businessMessage,
  callLink,
  normalizeIndianMobile,
  productMessage,
  whatsappLink,
} from './whatsapp.js';

describe('WhatsApp helpers (CONTRACT §10)', () => {
  it('normalizes valid Indian mobile numbers and rejects invalid ones', () => {
    expect(normalizeIndianMobile('98765 43210')).toBe('919876543210');
    expect(normalizeIndianMobile('+91 98765 43210')).toBe('919876543210');
    expect(normalizeIndianMobile('09876543210')).toBe('919876543210');
    expect(normalizeIndianMobile('5123456789')).toBeNull();
    expect(normalizeIndianMobile('98765 4321')).toBeNull();
  });

  it('creates the exact product and business messages with ASCII apostrophes', () => {
    expect(productMessage(
      { name: 'Chocolate Chunk Cookies', price: 350 },
      'https://tibu.in/p/cookies',
    )).toBe("Hi! I discovered your business through Tibu and I'm interested in your Chocolate Chunk Cookies (₹350). I'd like to know more.\nhttps://tibu.in/p/cookies");
    expect(businessMessage(
      { name: 'Mithai & More' },
      'https://tibu.in/b/mithai-and-more',
    )).toBe("Hi! I discovered Mithai & More through Tibu and I'd like to know more.\nhttps://tibu.in/b/mithai-and-more");
  });

  it('creates encoded WhatsApp and call links', () => {
    expect(whatsappLink('98765 43210', 'Hello & welcome!')).toBe(
      'https://wa.me/919876543210?text=Hello%20%26%20welcome!',
    );
    expect(callLink('+91 98765 43210')).toBe('tel:+919876543210');
    expect(whatsappLink('123', 'Hello')).toBeNull();
    expect(callLink('123')).toBeNull();
  });
});
