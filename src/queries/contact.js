/**
 * useContactAction — src/queries/contact.js
 *
 * Provides start(channel, { business, product }) which:
 *   - guest: opens the login gate (stores pending action in localStorage)
 *   - authenticated: calls revealContact, then navigates to the WA/call link
 *
 * Also registers 'whatsapp' and 'call' gate handlers here (constraint b —
 * GateResumer imports this module directly so handlers are always registered
 * before resumePending() runs, regardless of which page is loaded).
 *
 * CONTRACT §10 — message text from src/lib/whatsapp.js unchanged.
 */

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { businessMessage, callLink, productMessage, whatsappLink } from '../lib/whatsapp.js';
import { revealContact } from '../services/index.js';
import { registerGateHandler, useLoginGateStore } from '../stores/loginGate.js';
import { useAuthStore } from '../stores/auth.js';
import { qk } from './keys.js';

const SITE_URL = import.meta.env.VITE_SITE_URL ?? '';

// ---------------------------------------------------------------------------
// Plain function — shared between useContactAction and registered gate handlers
// (constraint a: gate handlers run outside React render, cannot call hooks)
// ---------------------------------------------------------------------------

/**
 * Core logic: reveal contact numbers and navigate to the WA/call link.
 * Returns a promise that resolves when done (or rejects on error).
 *
 * @param {{ type: 'whatsapp'|'call', payload: object }} action
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function performContactAction(action, queryClient = null) {
  const { type, payload } = action;
  const { businessId, businessSlug, businessName, product } = payload;

  /** @type {import('../services/contract.js').ContactInfo} */
  const contact = await revealContact({
    businessId,
    channel: type,
    productId: product?.id ?? null,
  });

  // Invalidate the connected-businesses cache after a successful reveal
  if (queryClient) {
    await queryClient.invalidateQueries({ queryKey: qk.connected });
  }

  if (type === 'whatsapp') {
    const number = contact.whatsapp;
    if (!number) {
      toast.error("This seller hasn't added a WhatsApp number");
      return;
    }
    const text = product
      ? productMessage(
          { name: product.name, price: product.price },
          `${SITE_URL}/p/${product.id}`,
        )
      : businessMessage({ name: businessName }, `${SITE_URL}/b/${businessSlug}`);

    const link = whatsappLink(number, text);
    if (link) {
      // Must use window.location.href, NOT window.open — iOS blocks pop-ups after an await
      window.location.href = link;
    }
    return;
  }

  if (type === 'call') {
    const number = contact.phone;
    if (!number) {
      toast.error("This seller hasn't added a phone number");
      return;
    }
    const link = callLink(number);
    if (link) {
      window.location.href = link;
    }
  }
}

// ---------------------------------------------------------------------------
// Register gate handlers once at module load time (constraint b)
// The module is imported by GateResumer unconditionally, so handlers are
// always present before resumePending() fires.
// ---------------------------------------------------------------------------

registerGateHandler('whatsapp', (action) => performContactAction(action));
registerGateHandler('call', (action) => performContactAction(action));

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

/**
 * Returns { start, pendingChannel }.
 *
 * start(channel, { business, product })
 *   channel: 'whatsapp' | 'call'
 *   business: { id, slug, name }
 *   product:  { id, name, price } | null | undefined
 *
 * @returns {{ start: Function, pendingChannel: string|null }}
 */
export function useContactAction() {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((s) => s.status);
  const gateRequest = useLoginGateStore((s) => s.request);
  const location = useLocation();
  const [pendingChannel, setPendingChannel] = useState(null);

  // Re-register handlers with a closure over the current queryClient so
  // replay after login uses the live client instance (constraint a).
  registerGateHandler('whatsapp', (action) => performContactAction(action, queryClient));
  registerGateHandler('call', (action) => performContactAction(action, queryClient));

  /**
   * @param {'whatsapp'|'call'} channel
   * @param {{ business: { id: string, slug: string, name: string }, product?: { id: string, name: string, price: number }|null }} ctx
   */
  async function start(channel, { business, product = null }) {
    if (authStatus === 'guest') {
      gateRequest({
        type: channel,
        payload: {
          businessId: business.id,
          businessSlug: business.slug,
          businessName: business.name,
          product: product ? { id: product.id, name: product.name, price: product.price } : null,
        },
        returnTo: location.pathname,
      });
      return;
    }

    // Authenticated — call directly
    setPendingChannel(channel);
    try {
      await performContactAction(
        {
          type: channel,
          payload: {
            businessId: business.id,
            businessSlug: business.slug,
            businessName: business.name,
            product: product ? { id: product.id, name: product.name, price: product.price } : null,
          },
        },
        queryClient,
      );
    } finally {
      setPendingChannel(null);
    }
  }

  return { start, pendingChannel };
}
