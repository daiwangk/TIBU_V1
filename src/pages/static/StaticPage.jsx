import PageHeader from '../../components/ui/PageHeader';

/**
 * Shared layout for the static content pages (About, Privacy, Terms, Help).
 *
 * @param {{
 *   title: string,
 *   intro?: string,
 *   draft?: boolean,
 *   sections?: Array<{ heading: string, paragraphs?: string[], list?: string[] }>,
 *   children?: React.ReactNode,
 * }} props
 */
export default function StaticPage({ title, intro, draft = false, sections = [], children }) {
  return (
    <main className="flex min-h-full flex-col bg-surface">
      <PageHeader title={title} fallbackTo="/profile" />

      <div className="flex max-w-[70ch] flex-col gap-6 px-screen py-6">
        {intro && <p className="font-body text-base text-body">{intro}</p>}

        {draft && (
          <p
            role="note"
            className="rounded-card bg-lavender px-3 py-2 font-body text-sm font-semibold text-ink"
          >
            Draft — final text from Tibu
          </p>
        )}

        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">{section.heading}</h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="font-body text-sm leading-relaxed text-body">
                {text}
              </p>
            ))}
            {section.list && (
              <ul className="list-disc pl-5 font-body text-sm leading-relaxed text-body">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {children}
      </div>
    </main>
  );
}
