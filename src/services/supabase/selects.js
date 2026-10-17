/**
 * Shared PostgREST select fragments. Column names must exist in supabase/migrations
 * (selects.test.js checks this). `products` has no category_slug: the category comes
 * from the `categories ( slug, name )` embed (product override), and mappers fall back
 * to the business category.
 */

// Business row that mapBusinessSummary can consume.
export const BIZ_SUMMARY_COLS = [
  'id', 'slug', 'name', 'status', 'logo_url', 'banner_url',
  'locality', 'city', 'rating_avg', 'rating_count',
  'available_today', 'delivery_available', 'pickup_available',
  'approved_at', 'categories ( slug, name )',
].join(', ');

// Product row that mapProductSummaryNested can consume.
export const PRODUCT_SUMMARY_COLS = [
  'id', 'name', 'price_paise', 'available_today', 'is_active', 'created_at',
  'categories ( slug, name )',
  'product_images ( id, url, sort_order )',
].join(', ');
