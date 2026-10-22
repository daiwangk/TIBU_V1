/** Where a seller without a submitted shop is sent. */
export const ONBOARDING_PATH = '/seller/onboarding';

/**
 * Where SellerGate should redirect a seller, or null to let the route render. A seller with no
 * business yet, or one still in 'draft', may only use the onboarding route.
 *
 * @param {{ status: string }|null|undefined} business from getMyBusiness()
 * @param {string} pathname
 * @returns {string|null}
 */
export function sellerGateRedirect(business, pathname) {
  const needsOnboarding = !business || business.status === 'draft';
  if (!needsOnboarding) return null;
  const onOnboarding = pathname === ONBOARDING_PATH || pathname.startsWith(`${ONBOARDING_PATH}/`);
  return onOnboarding ? null : ONBOARDING_PATH;
}
