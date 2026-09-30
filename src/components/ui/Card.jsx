/**
 * Surface card wrapper.
 *
 * @param {{
 *   bordered?: boolean,
 *   padded?: boolean,
 *   lg?: boolean,
 *   children: React.ReactNode,
 *   className?: string,
 *   [key: string]: any,
 * }} props
 */
export default function Card({
  bordered = false,
  padded = true,
  lg = false,
  children,
  className = '',
  ...rest
}) {
  return (
    <div
      className={`
        bg-surface
        ${lg ? 'rounded-card-lg' : 'rounded-card'}
        ${bordered ? 'border border-border' : ''}
        ${padded ? 'p-4' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}
