/**
 * Login sheet title for the action that opened it (`loginGate.pending`).
 *
 * @param {{ type?: string, payload?: { businessName?: string } }|null|undefined} pending
 * @returns {string}
 */
export function gateTitle(pending) {
  switch (pending?.type) {
    case 'whatsapp':
    case 'call': {
      const name = pending.payload?.businessName?.trim();
      return name ? `Log in to contact ${name}` : 'Log in to contact the seller';
    }
    case 'save':
      return 'Log in to save';
    case 'enquiry':
      return 'Log in to send an enquiry';
    case 'review':
      return 'Log in to write a review';
    default:
      return 'Log in to continue';
  }
}

/**
 * Sign-up link from the sheet: the pending action stays in localStorage, `next` brings them back.
 *
 * @param {string|null|undefined} returnTo
 * @returns {string}
 */
export function signupHref(returnTo) {
  return returnTo ? `/signup?next=${encodeURIComponent(returnTo)}` : '/signup';
}
