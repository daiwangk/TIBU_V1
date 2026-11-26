import { ChevronLeft } from 'lucide-react';
import useAppBack from '../../lib/useAppBack.js';
import IconButton from './IconButton';

/**
 * Page header with back navigation, title, and optional right-side actions.
 *
 * Back button behaviour:
 *   - An earlier in-app history entry exists → navigate(-1)
 *   - Otherwise → navigate to `fallbackTo` with `{ replace: true }`
 *
 * @param {{
 *   title: string,
 *   titleAs?: 'h1' | 'p',   // use 'p' when the page body has its own h1
 *   fallbackTo?: string,
 *   actions?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function PageHeader({ title, titleAs: TitleTag = 'h1', fallbackTo = '/', actions, className = '' }) {
  const handleBack = useAppBack(fallbackTo);

  return (
    <header
      className={`
        flex h-14 items-center gap-2 px-screen
        bg-bg/95 backdrop-blur-[14px] border-b border-border
        sticky top-0 z-10
        ${className}
      `}
    >
      <IconButton label="Go back" onClick={handleBack} className="-ml-2">
        <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
      </IconButton>

      <TitleTag className="flex-1 font-heading font-extrabold text-primary text-lg leading-tight truncate">
        {title}
      </TitleTag>

      {actions && (
        <div className="flex items-center gap-1 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
