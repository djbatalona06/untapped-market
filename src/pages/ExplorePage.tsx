import { useStore } from '../store/useStore';
import { MEDIA_ITEMS } from '../data/mockData';
import { EtherealLinks } from '../components/EtherealLinks';

export function ExplorePage() {
  const navigate = useStore((s) => s.navigate);
  return (
    <div className="page">
      <header className="page-header">
        <h1>
          The <em>journal</em>
        </h1>
        <p>Long-form science writing, terpene deep-dives, and stories from the PNW growing community.</p>
      </header>
      <section>
        <div className="strain-grid">
          {MEDIA_ITEMS.map((m) => (
            <div key={m.id} className="strain-card">
              <div
                className="strain-card-stripe"
                style={{
                  background:
                    m.category === 'Science'
                      ? 'var(--teal)'
                      : m.category === 'PNW'
                      ? 'var(--accent)'
                      : m.category === 'Terpenes'
                      ? 'var(--purple)'
                      : 'var(--amber)',
                }}
              />
              <div className="strain-card-body">
                <div
                  className="muted"
                  style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                >
                  {m.category} · {m.date}
                </div>
                <div className="strain-card-name" style={{ fontSize: '1.1rem' }}>
                  {m.thumb} {m.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <EtherealLinks
        title={<>Ethereal <em>tooling</em></>}
        subtitle="Curated AI generators we partner with for video, image, and audio production."
      />
      <section style={{ paddingTop: 0 }}>
        <button className="btn" onClick={() => navigate({ page: 'quiz' })}>
          Try the AI Match quiz →
        </button>
      </section>
    </div>
  );
}
