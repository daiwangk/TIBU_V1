/**
 * /dev/ui section frame for the Gallery*.jsx files (same look as the sections in UiGalleryPage).
 *
 * @param {{ id: string, title: string, description?: string, children: React.ReactNode }} props
 */
export default function GallerySection({ id, title, description, children }) {
  return (
    <section id={id} className="flex flex-col gap-4 py-6 border-b border-border">
      <div className="px-screen">
        <h2 className="font-heading font-bold text-primary text-xl">{title}</h2>
        {description && <p className="font-body text-xs text-muted mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}
