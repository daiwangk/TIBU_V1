/**
 * Skeleton placeholder for loading states.
 *
 * Heights for rect: use `className` with Tailwind h-* classes.
 * Width for circle: use `size` preset.
 *
 * @param {{
 *   variant?: 'rect' | 'circle' | 'text',
 *   size?: 'sm' | 'md' | 'lg' | 'xl',
 *   lines?: number,
 *   className?: string,
 * }} props
 */
export default function Skeleton({
  variant = 'rect',
  size = 'md',
  lines = 3,
  className = '',
}) {
  const base = 'animate-pulse bg-border rounded';

  const circleSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size] ?? 'w-10 h-10';

  if (variant === 'circle') {
    return (
      <span
        aria-hidden="true"
        className={`${base} rounded-full block flex-shrink-0 ${circleSize} ${className}`}
      />
    );
  }

  if (variant === 'text') {
    return (
      <div aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <span
            key={i}
            className={`${base} h-4 block ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  // rect (default) — caller controls h-* and w-* via className
  return (
    <span
      aria-hidden="true"
      className={`${base} block w-full h-4 ${className}`}
    />
  );
}
