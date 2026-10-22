/** The seven onboarding steps (B4.2). Numbers match `step` in the submit checklist (CONTRACT §5). */
export const STEPS = [
  { n: 1, key: 'basics', title: 'Basics' },
  { n: 2, key: 'location', title: 'Location' },
  { n: 3, key: 'contact', title: 'Contact' },
  { n: 4, key: 'branding', title: 'Branding' },
  { n: 5, key: 'products', title: 'Products' },
  { n: 6, key: 'videos', title: 'Videos' },
  { n: 7, key: 'review', title: 'Review & submit' },
];

export const STEP_COUNT = STEPS.length;

/**
 * Whether a step has everything it needs, judged from the saved business (so leaving and coming back
 * resumes in the right place). Videos are optional, so that step always counts as done.
 *
 * @param {number} step 1–7
 * @param {import('../../../services/contract.js').MyBusiness|null|undefined} business
 * @returns {boolean}
 */
export function isStepComplete(step, business) {
  if (!business) return false;
  switch (step) {
    case 1:
      return Boolean(business.name?.trim() && business.categorySlug && business.description?.trim());
    case 2:
      return business.lat != null && business.lng != null && Boolean(business.locality);
    case 3:
      return Boolean(business.contacts?.phone && business.contacts?.whatsapp && business.instagramHandle);
    case 4:
      return Boolean(business.logoUrl);
    case 5:
      return (business.products ?? []).some((p) => p.isActive && (p.images ?? []).length > 0);
    case 6:
      return true;
    case 7:
      return business.status !== 'draft';
    default:
      return false;
  }
}

/**
 * The first step that is not complete (1 when there is no business yet; the last step when all are).
 *
 * @param {import('../../../services/contract.js').MyBusiness|null|undefined} business
 * @returns {number}
 */
export function firstIncompleteStep(business) {
  const step = STEPS.find((s) => !isStepComplete(s.n, business));
  return step ? step.n : STEP_COUNT;
}

/**
 * The step to show for a `?step=` value: the first incomplete step when it is missing or not a number,
 * never past the first incomplete step (earlier steps can be revisited, later ones cannot be skipped to).
 *
 * @param {string|null|undefined} raw
 * @param {import('../../../services/contract.js').MyBusiness|null|undefined} business
 * @returns {number}
 */
export function clampStep(raw, business) {
  const limit = firstIncompleteStep(business);
  if (raw == null || !/^\d+$/.test(String(raw))) return limit;
  return Math.min(Math.max(1, Number(raw)), limit);
}

/**
 * The saved business as a full `BusinessInput`. `saveMyBusiness` writes every field, so each step sends
 * the whole object with its own fields changed.
 *
 * @param {import('../../../services/contract.js').MyBusiness|null|undefined} business
 * @returns {import('../../../services/contract.js').BusinessInput}
 */
export function businessToInput(business) {
  return {
    name: business?.name ?? '',
    description: business?.description ?? '',
    categorySlug: business?.categorySlug ?? '',
    addressText: business?.addressText ?? '',
    locality: business?.locality ?? '',
    city: business?.city || 'Mumbai',
    lat: business?.lat ?? null,
    lng: business?.lng ?? null,
    instagramHandle: business?.instagramHandle ?? '',
    deliveryAvailable: Boolean(business?.deliveryAvailable),
    pickupAvailable: Boolean(business?.pickupAvailable),
    deliveryTime: business?.deliveryTime ?? null,
    establishedYear: business?.establishedYear ?? null,
  };
}

/**
 * Categories a business can pick (leaves only), grouped by parent for the select: parents that have
 * children become groups, childless top-level categories stand alone.
 *
 * @param {import('../../../services/contract.js').Category[]} categories
 * @returns {{ groups: Array<{ parent: import('../../../services/contract.js').Category, children: import('../../../services/contract.js').Category[] }>, singles: import('../../../services/contract.js').Category[] }}
 */
export function groupLeafCategories(categories) {
  const bySort = (a, b) => a.sortOrder - b.sortOrder;
  const parents = categories.filter((c) => c.parentSlug == null).sort(bySort);
  const groups = [];
  const singles = [];
  for (const parent of parents) {
    const children = categories.filter((c) => c.parentSlug === parent.slug).sort(bySort);
    if (children.length > 0) groups.push({ parent, children });
    else singles.push(parent);
  }
  return { groups, singles };
}
