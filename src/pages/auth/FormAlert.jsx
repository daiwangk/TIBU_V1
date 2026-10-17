import { CircleAlert, CircleCheck } from 'lucide-react';

/**
 * Form-level message above or below the fields.
 *
 * @param {{ tone?: 'error' | 'success', children: React.ReactNode, className?: string }} props
 */
export default function FormAlert({ tone = 'error', children, className = '' }) {
  const isError = tone === 'error';
  const Icon = isError ? CircleAlert : CircleCheck;
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-card px-3 py-2.5 font-body text-sm text-ink ${
        isError ? 'bg-blush' : 'bg-mint'
      } ${className}`}
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${isError ? 'text-error' : ''}`} aria-hidden="true" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
