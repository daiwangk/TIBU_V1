import Button from './Button';

/**
 * Empty state illustration with optional action.
 *
 * @param {{
 *   icon: React.ReactNode,
 *   title: string,
 *   text?: string,
 *   action?: { label: string, onClick: () => void },
 *   className?: string,
 * }} props
 */
export default function EmptyState({ icon, title, text, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-12 px-screen text-center ${className}`}
    >
      <span className="flex items-center justify-center w-16 h-16 rounded-full bg-lavender text-primary">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-heading font-bold text-ink text-lg">{title}</p>
        {text && <p className="font-body text-muted text-sm">{text}</p>}
      </div>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
