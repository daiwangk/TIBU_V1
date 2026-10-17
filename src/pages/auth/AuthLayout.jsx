import { Link } from 'react-router-dom';
import Logo from '../../components/brand/Logo';

/**
 * Shared frame for the auth screens: logo, then a pastel-topped card with an icon, title and text.
 * Plain document flow (no fixed footer) so the phone keyboard scrolls the submit button into view.
 *
 * @param {{
 *   icon: React.ReactNode,
 *   title: string,
 *   text?: React.ReactNode,
 *   children: React.ReactNode,
 *   footer?: React.ReactNode,
 * }} props
 */
export default function AuthLayout({ icon, title, text, children, footer }) {
  return (
    <div className="flex min-h-svh flex-col bg-bg px-screen pt-4 pb-10">
      <Link
        to="/"
        aria-label="Tibu home"
        className="inline-flex min-h-11 min-w-11 items-center self-start rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Logo />
      </Link>

      <main className="mt-4 overflow-hidden rounded-card-lg border border-border bg-surface">
        <div className="flex flex-col items-center gap-3 bg-lavender px-5 pt-6 pb-5 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary" aria-hidden="true">
            {icon}
          </span>
          <h1 className="font-heading text-2xl font-bold leading-tight text-ink">{title}</h1>
          {text && <p className="font-body text-sm text-body">{text}</p>}
        </div>
        <div className="px-5 pt-5 pb-6">{children}</div>
      </main>

      {footer && <div className="mt-5 flex flex-col items-center gap-1 text-center font-body text-sm text-body">{footer}</div>}
    </div>
  );
}
