/**
 * Minimal section layout: a narrow label column and a content column,
 * separated from the previous section by a hairline.
 */
export function Block({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line">
      <div className="container-x grid gap-8 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="lg:col-span-4">
          <p className="eyebrow">{label}</p>
          {title && <h2 id={`${id}-title`} className="mt-3 font-serif text-3xl leading-tight text-ink lg:text-4xl">{title}</h2>}
          {!title && <h2 id={`${id}-title`} className="sr-only">{label}</h2>}
        </div>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
