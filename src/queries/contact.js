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
import { siteUrl } from '../lib/siteUrl.js';
import { businessMessage, callLink, productMessage, whatsappLink } from '../lib/whatsapp.js';
import { revealContact } from '../services/index.js';
import { registerGateHandler, useLoginGateStore } from '../stores/loginGate.js';
import { useAuthStore } from '../stores/auth.js';
import { userMessage } from '../lib/errors.js';
import { qk } from './keys.js';

// ---------------------------------------------------------------------------
// Plain function — shared between useContactAction and registered gate handlers
// (constraint a: gate handlers run outside React render, cannot call hooks)
// ---------------------------------------------------------------------------

/**
 * Core logic: reveal contact numbers and navigate to the WA/call link.
 * Catches errors: re-opens gate on auth_required, toasts other failures.
 *
 * @param {{ type: 'whatsapp'|'call', payload: object, returnTo?: string }} action
 * @param {import('@tanstack/react-query').QueryClient|null} queryClient
 */
export async function performContactAction(action, queryClient = null) {
  const { type, payload } = action;
  const { businessId, businessSlug, businessName, product } = payload;

  try {
    /** @type {import('../services/contract.js').ContactInfo} */
    const contact = await revealContact({
      businessId,
      channel: type,
      productId: product?.id ?? null,
    });

    // Invalidate the connected-businesses cache without blocking the redirect
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: qk.connected }).catch(() => {});
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
            `${siteUrl()}/p/${product.id}`,
          )
        : businessMessage({ name: businessName }, `${siteUrl()}/b/${businessSlug}`);

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
  } catch (err) {
    if (err?.code === 'auth_required') {
      useLoginGateStore.getState().request(action);
      return;
    }
    toast.error(userMessage(err));
  }
}

// ---------------------------------------------------------------------------
// Register gate handlers once at module load time (constraint b)
// GateResumer passes its queryClient through resumePending(queryClient).
// ---------------------------------------------------------------------------

registerGateHandler('whatsapp', (action, qc) => performContactAction(action, qc));
registerGateHandler('call', (action, qc) => performContactAction(action, qc));

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
 * `ready` is false while the session is being restored; start() ignores taps then, so the buttons must be
 * disabled (ContactButtons `disabled`) rather than left to swallow them.
 *
 * @returns {{ start: Function, pendingChannel: string|null, ready: boolean }}
 */
export function useContactAction() {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((s) => s.status);
  const gateRequest = useLoginGateStore((s) => s.request);
  const location = useLocation();
  const [pendingChannel, setPendingChannel] = useState(null);

  /**
   * @param {'whatsapp'|'call'} channel
   * @param {{ business: { id: string, slug: string, name: string }, product?: { id: string, name: string, price: number }|null }} ctx
   */
  async function start(channel, { business, product = null }) {
    // Guard against double taps while a reveal is already in flight
    if (pendingChannel) return;

    // Ignore taps while initial session check is loading
    if (authStatus === 'loading') return;

    const action = {
      type: channel,
      payload: {
        businessId: business.id,
        businessSlug: business.slug,
        businessName: business.name,
        product: product ? { id: product.id, name: product.name, price: product.price } : null,
      },
      returnTo: location.pathname + location.search,
    };

    if (authStatus !== 'authenticated') {
      gateRequest(action);
      return;
    }

    // Authenticated — call directly
    setPendingChannel(channel);
    try {
      await performContactAction(action, queryClient);
    } finally {
      setPendingChannel(null);
    }
  }

  return { start, pendingChannel, ready: authStatus !== 'loading' };
}
