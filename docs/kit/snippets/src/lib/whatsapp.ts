// src/lib/whatsapp.ts — pre-filled WhatsApp + call links (SOW §3 "WhatsApp & Call Contact")
import { formatPrice } from './format';

const SITE = import.meta.env.VITE_SITE_URL ?? 'https://tibu.in';

/** Normalise an Indian mobile to wa.me format: "98765 43210" → "919876543210" */
export function toIntl(num: string) {
  const d = num.replace(/\D/g, '').replace(/^0+/, '');
  return d.length === 10 ? `91${d}` : d;
}

export const productUrl  = (id: string) => `${SITE}/p/${id}`;
export const businessUrl = (slug: string) => `${SITE}/b/${slug}`;

export function productMessage(p: { id: string; name: string; price_paise: number }) {
  return `Hi! I discovered your business through Tibu and I'm interested in your ${p.name} (${formatPrice(p.price_paise)}). I'd like to know more.\n${productUrl(p.id)}`;
}

export function businessMessage(b: { name: string; slug: string }) {
  return `Hi! I discovered ${b.name} through Tibu and I'd like to know more.\n${businessUrl(b.slug)}`;
}

export const whatsappLink = (whatsapp: string, text: string) =>
  `https://wa.me/${toIntl(whatsapp)}?text=${encodeURIComponent(text)}`;

export const callLink = (phone: string) => `tel:+${toIntl(phone)}`;

/*
Usage in a ContactButtons component (login gate + logging in one RPC):

  const { data, error } = await supabase.rpc('reveal_contact', {
    p_business: business.id, p_channel: 'whatsapp', p_product: product?.id ?? null,
  });
  if (rpcErrorCode(error) === 'login_required') return openLoginSheet({ resume: 'whatsapp' });
  const { whatsapp } = data![0];
  window.location.href = whatsappLink(whatsapp, product ? productMessage(product) : businessMessage(business));

iOS Safari blocks window.open after an await — use location.href as above.
*/
