import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import IconButton from './IconButton';

/**
 * Page header with back navigation, title, and optional right-side actions.
 *
 * Back button behaviour:
 *   - `useLocation().key !== 'default'` → there is browser history → navigate(-1)
 *   - Otherwise → navigate to `fallbackTo` with `{ replace: true }`
 *
 * @param {{
 *   title: string,
 *   fallbackTo?: string,
 *   actions?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function PageHeader({ title, fallbackTo = '/', actions, className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  function handleBack() {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallbackTo, { replace: true });
    }
  }

  return (
    <header
      className={`
        flex items-center gap-2 px-screen py-3
        bg-surface border-b border-border
        sticky top-0 z-10
        ${className}
      `}
    >
      <IconButton label="Go back" onClick={handleBack} className="-ml-2">
        <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
      </IconButton>

      <h1 className="flex-1 font-heading font-bold text-ink text-lg leading-tight truncate">
        {title}
      </h1>

      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
