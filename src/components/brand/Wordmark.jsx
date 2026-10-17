import Spark from '../decor/Spark';
import Tagline from './Tagline';

const SIZES = {
  sm: 'text-2xl',
  md: 'text-[1.75rem]',
  lg: 'text-4xl',
};

/**
 * Placeholder text wordmark: "TIBU" in Nunito 900 plum with a coral spark, optional tagline below.
 * Render it through `Logo.jsx` (design-system rule), not directly.
 * TODO(logo): replace with the client's final logo when it arrives; only this file changes.
 *
 * @param {{ size?: 'sm' | 'md' | 'lg', tagline?: boolean, className?: string }} props
 */
export default function Wordmark({ size = 'md', tagline = false, className = '' }) {
  return (
    <span className={`inline-flex flex-col items-start ${className}`}>
      <span className={`inline-flex items-start font-heading font-black leading-none tracking-wide text-primary select-none ${SIZES[size] ?? SIZES.md}`}>
        TIBU
        <Spark className="-mt-[0.2em] ml-[0.05em] h-[0.5em] w-[0.5em] text-coral" />
      </span>
      {tagline && <Tagline className="mt-1" />}
    </span>
  );
}
