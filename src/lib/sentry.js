import * as Sentry from '@sentry/react';

/**
 * Whether Sentry.init() has been called successfully.
 * Used by ErrorBoundary to guard captureException calls.
 * @type {boolean}
 */
let _active = false;

/**
 * Categories of breadcrumbs that may contain PII (URLs, request bodies,
 * user-typed text, console messages). We drop them all before any data
 * leaves the browser.
 */
const BLOCKED_BREADCRUMB_CATEGORIES = new Set(['fetch', 'xhr', 'console', 'ui.input']);

/**
 * Initialises Sentry error reporting.
 *
 * No-ops when:
 *  - VITE_SENTRY_DSN is empty / absent, or
 *  - running in Vite dev mode (import.meta.env.DEV === true).
 *
 * Privacy guarantees:
 *  - sendDefaultPii: false — no IPs, cookies, or auth headers.
 *  - tracesSampleRate: 0 — no performance / distributed tracing data.
 *  - No Session Replay integration added.
 *  - beforeBreadcrumb drops fetch, xhr, console and ui.input entries so no
 *    URLs, request payloads, console messages or input values are sent.
 *  - beforeSend strips request.data and request.query_string so query params
 *    and POST bodies never leave the browser even if captured accidentally.
 *  - Sentry.setUser() is intentionally never called anywhere in this project.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn || import.meta.env.DEV) {
    return;
  }

  Sentry.init({
    dsn,
    sendDefaultPii: false,
    tracesSampleRate: 0,

    beforeBreadcrumb(breadcrumb) {
      if (BLOCKED_BREADCRUMB_CATEGORIES.has(breadcrumb.category)) {
        return null; // drop — may contain PII
      }
      return breadcrumb;
    },

    beforeSend(event) {
      // Strip the request body and query string — these can contain emails,
      // phone numbers, or other user-supplied data.
      if (event.request) {
        delete event.request.data;
        delete event.request.query_string;
      }
      return event;
    },
  });

  _active = true;
}

/**
 * Returns true only after initSentry() has completed a real Sentry.init()
 * call (i.e. not in dev and DSN was provided).
 *
 * @returns {boolean}
 */
export function isSentryActive() {
  return _active;
}
