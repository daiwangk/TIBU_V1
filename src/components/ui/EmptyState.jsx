import Button from './Button';
import Blob from '../decor/Blob';
import Spark from '../decor/Spark';

/**
 * Empty state: the icon on a soft-sage blob with a coral spark (or a custom `illustration`),
 * a plum title, a line of copy and an optional action.
 * `action.to` renders the button as a link; otherwise `action.onClick` is called.
 *
 * @param {{
 *   icon?: React.ReactNode,
 *   illustration?: React.ReactNode,
 *   title: string,
 *   text?: string,
 *   action?: { label: React.ReactNode, onClick?: () => void, to?: string },
 *   actionVariant?: 'primary' | 'secondary' | 'accent',
 *   className?: string,
 * }} props
 */
export default function EmptyState({
  icon,
  illustration,
  title,
  text,
  action,
  actionVariant = 'primary',
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 px-screen text-center ${className}`}
    >
      {illustration ?? (
        <span className="relative flex h-24 w-24 items-center justify-center" aria-hidden="true">
          <Blob variant={2} className="absolute inset-0 h-full w-full text-mint" />
          <Spark className="absolute -top-1 -right-1 h-6 w-6 text-coral" />
          <span className="relative text-primary">{icon}</span>
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="font-heading font-extrabold text-primary text-lg">{title}</p>
        {text && <p className="font-body text-muted text-sm">{text}</p>}
      </div>
      {action && (
        <Button variant={actionVariant} to={action.to} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
