// src/queries/keys.js — params always inside the key so changes refetch
export const qk = {
  categories: ['categories'],
  businesses: (params) => ['businesses', params],
  products: (params) => ['products', params],
  business: (slug, near) => ['business', slug, near ?? null],
  product: (id, near) => ['product', id, near ?? null],
  reviews: (businessId, page) => ['reviews', businessId, page],
  me: ['me'], saved: ['saved'], recent: ['recent'], connected: ['connected'],
  myBusiness: ['myBusiness'], myProducts: ['myProducts'],
  applications: (status) => ['applications', status], application: (id) => ['application', id],
  threads: (as) => ['threads', as], thread: (id) => ['thread', id], myThread: (businessId) => ['myThread', businessId],
  notifications: ['notifications'], unread: ['unread'], myStats: ['myStats'],
};
