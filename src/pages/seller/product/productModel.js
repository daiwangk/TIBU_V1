import { z } from 'zod';

export const PRICE_MAX = 1_000_000;
export const DETAILS_MAX_ROWS = 12;
export const DETAIL_LABEL_MAX = 40;
export const DETAIL_VALUE_MAX = 200;
export const PRODUCT_IMAGES_MAX = 5;

/** The product form. Price and the delivery time stay strings (they are input fields). */
export const productSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(100, 'Use 100 characters or fewer'),
  price: z
    .string()
    .trim()
    .refine((v) => /^\d+$/.test(v) && Number(v) <= PRICE_MAX, 'Enter a whole-rupee price up to ₹10,00,000'),
  description: z.string().trim().max(2000, 'Use 2000 characters or fewer'),
  categorySlug: z.string(),
  details: z
    .array(
      z.object({
        label: z.string().trim().max(DETAIL_LABEL_MAX, `Use ${DETAIL_LABEL_MAX} characters or fewer`),
        value: z.string().trim().max(DETAIL_VALUE_MAX, `Use ${DETAIL_VALUE_MAX} characters or fewer`),
      }),
    )
    .max(DETAILS_MAX_ROWS, `Add up to ${DETAILS_MAX_ROWS} details`),
  availableToday: z.boolean(),
  isActive: z.boolean(),
  deliveryMode: z.enum(['same', 'custom']),
  deliveryAvailable: z.boolean(),
  pickupAvailable: z.boolean(),
  deliveryTime: z.string().trim().max(40, 'Use 40 characters or fewer'),
});

/**
 * Form values for a saved product (or a blank form when `product` is null). The category select shows
 * "Same as my shop" unless the product's category differs from the business's, and delivery starts as
 * "Same as my shop" unless the product has an override.
 *
 * @param {import('../../../services/contract.js').MyProduct|null|undefined} product
 * @param {import('../../../services/contract.js').MyBusiness} business
 */
export function productToForm(product, business) {
  const override = product?.deliveryOverride ?? null;
  return {
    name: product?.name ?? '',
    price: product ? String(product.price) : '',
    description: product?.description ?? '',
    categorySlug: product && product.categorySlug !== business.categorySlug ? product.categorySlug : '',
    details: (product?.details ?? []).map((r) => ({ label: r.label, value: r.value })),
    availableToday: Boolean(product?.availableToday),
    isActive: product ? product.isActive : true,
    deliveryMode: override ? 'custom' : 'same',
    deliveryAvailable: override ? override.deliveryAvailable : Boolean(business.deliveryAvailable),
    pickupAvailable: override ? override.pickupAvailable : Boolean(business.pickupAvailable),
    deliveryTime: override?.deliveryTime ?? '',
  };
}

/**
 * Form values → `saveProduct` input. Detail rows without both a label and a value are dropped; "Same as
 * my shop" sends `deliveryOverride: null`; a custom delivery time only counts while delivery is on.
 *
 * @param {z.infer<typeof productSchema>} values
 * @param {string|null} [id] omit to create
 * @returns {import('../../../services/contract.js').ProductInput}
 */
export function formToProductInput(values, id = null) {
  const custom = values.deliveryMode === 'custom';
  return {
    ...(id ? { id } : {}),
    name: values.name,
    price: Number(values.price),
    description: values.description,
    categorySlug: values.categorySlug === '' ? null : values.categorySlug,
    details: values.details
      .map((r) => ({ label: r.label.trim(), value: r.value.trim() }))
      .filter((r) => r.label && r.value),
    availableToday: values.availableToday,
    isActive: values.isActive,
    deliveryOverride: custom
      ? {
          deliveryAvailable: values.deliveryAvailable,
          pickupAvailable: values.pickupAvailable,
          deliveryTime: values.deliveryAvailable && values.deliveryTime !== '' ? values.deliveryTime : null,
        }
      : null,
  };
}

/**
 * Rows to prefill from a category template when the details list is empty or untouched (no values yet).
 *
 * @param {Array<{ label: string, value: string }>} rows current rows
 * @param {string[]} labels the category's template
 * @returns {Array<{ label: string, value: string }>|null} replacement rows, or null to leave the rows alone
 */
export function prefillDetails(rows, labels) {
  if (rows.some((r) => r.value.trim() !== '')) return null;
  return labels.slice(0, DETAILS_MAX_ROWS).map((label) => ({ label, value: '' }));
}
