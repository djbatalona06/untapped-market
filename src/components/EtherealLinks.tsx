import type { ReactNode } from 'react';
import { ETHEREAL_TOOLS } from '../data/mockData';

interface Props {
  filter?: 'video' | 'image' | 'audio';
  title?: ReactNode;
  subtitle?: string;
}

export function EtherealLinks({ filter, title, subtitle }: Props) {
  const tools = filter ? ETHEREAL_TOOLS.filter((t) => t.kind === filter) : ETHEREAL_TOOLS;
  return (
    <section>
      <div className="section-head">
        <div>
          <h2 className="section-title">
            {title ?? <>Ethereal <em>visual studio</em></>}
          </h2>
          {subtitle && <p className="muted" style={{ marginTop: 4, fontSize: '0.9rem' }}>{subtitle}</p>}
        </div>
      </div>
      <div className="ethereal-grid">
        {tools.map((t) => (
          <a
            key={t.name}
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ethereal-card"
          >
            <div className="ethereal-kind">{t.kind}</div>
            <div className="ethereal-name">{t.name}</div>
            <div className="ethereal-blurb">{t.blurb}</div>
          </a>
        ))}
      </div>
    </section>
  );
}
