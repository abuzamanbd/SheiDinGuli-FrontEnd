import Link from 'next/link';

export function SectionHead({ eyebrow, title, linkLabel, linkHref, onDark }: { eyebrow?: string; title?: string; linkLabel?: string; linkHref?: string; onDark?: boolean }) {
  return (
    <div className={`c-section-head${onDark ? ' c-section-head--on-dark' : ''}`}>
      <div>
        {eyebrow && <span className="c-section-head__eyebrow">{eyebrow}</span>}
        <h2 className="c-section-head__title">{title}</h2>
        <span className="c-section-head__rule" />
      </div>
      {linkLabel && linkHref && <Link href={linkHref} className="c-section-head__link">{linkLabel}</Link>}
    </div>
  );
}
