/**
 * A titled block on the application detail page.
 *
 * @param {{ id: string, title: string, children: React.ReactNode }} props
 */
export default function AdminSection({ id, title, children }) {
  const headingId = `admin-${id}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="font-heading text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
