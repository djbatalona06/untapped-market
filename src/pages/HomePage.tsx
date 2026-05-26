import { useState } from 'react';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { DISPENSARIES } from '../data/dispensaries';
import { MEDIA_ITEMS } from '../data/mockData';
import { StrainCard } from '../components/StrainCard';
import { EtherealLinks } from '../components/EtherealLinks';

export function HomePage() {
  const navigate = useStore((s) => s.navigate);
  const [query, setQuery] = useState('');

  const spotlightStrains = STRAINS.slice(0, 4);
  const highCBD = STRAINS.filter((s) => s.cbd >= 5).slice(0, 4);

  function search() {
    navigate({ page: 'catalog', query: query.trim() || undefined });
  }

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">Pacific Northwest Cannabis Discovery</div>
          <h1>
            Find <em>your strain</em> through<br />
            terpenes, lab data, and intention.
          </h1>
          <p>
            100+ verified Seattle-area dispensaries, an AI strain recommender, live restock
            alerts, and a science-grade strain library — designed for the modern, deliberate
            consumer.
          </p>
          <div className="hero-search">
            <input
              placeholder="Search a strain, dispensary, or city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button onClick={search}>Search</button>
          </div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button className="btn-ghost btn" onClick={() => navigate({ page: 'quiz' })}>
              ✨ Take the AI Match Quiz
            </button>
            <button className="btn-ghost btn" onClick={() => navigate({ page: 'finder' })}>
              📍 Map the Dispensaries
            </button>
          </div>
        </div>
      </div>

      <section>
        <div className="section-head">
          <h2 className="section-title">
            This week's <em>spotlight</em>
          </h2>
          <button className="section-link" onClick={() => navigate({ page: 'catalog' })}>
            See all {STRAINS.length} strains →
          </button>
        </div>
        <div className="strain-grid">
          {spotlightStrains.map((s) => (
            <StrainCard key={s.id} strain={s} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2 className="section-title">
            High-CBD <em>wellness picks</em>
          </h2>
          <button className="section-link" onClick={() => navigate({ page: 'catalog' })}>
            Filter by chemotype →
          </button>
        </div>
        <div className="strain-grid">
          {highCBD.map((s) => (
            <StrainCard key={s.id} strain={s} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2 className="section-title">
            {DISPENSARIES.length} dispensaries, <em>mapped in real time</em>
          </h2>
          <button className="section-link" onClick={() => navigate({ page: 'finder' })}>
            Open finder →
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 18 }}>
          From Capitol Hill to Tacoma, every shop is plotted with hours, phone, ratings, and
          live strain availability. Get directions in one tap.
        </p>
        <div
          className="row"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            justifyContent: 'space-around',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '2rem', color: 'var(--accent)' }}>
              {DISPENSARIES.length}
            </div>
            <div className="muted" style={{ fontSize: '0.78rem' }}>Verified shops</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '2rem', color: 'var(--amber)' }}>
              {STRAINS.length}
            </div>
            <div className="muted" style={{ fontSize: '0.78rem' }}>Cultivars</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: '2rem', color: 'var(--teal)' }}>25mi</div>
            <div className="muted" style={{ fontSize: '0.78rem' }}>Seattle radius</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2 className="section-title">
            From the <em>journal</em>
          </h2>
        </div>
        <div className="strain-grid">
          {MEDIA_ITEMS.slice(0, 4).map((m) => (
            <div key={m.id} className="strain-card">
              <div className="strain-card-stripe" style={{ background: 'var(--teal)' }} />
              <div className="strain-card-body">
                <div className="muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {m.category} · {m.date}
                </div>
                <div className="strain-card-name" style={{ fontSize: '1.05rem' }}>
                  {m.thumb} {m.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EtherealLinks
        title={<>Ethereal <em>creative stack</em></>}
        subtitle="Generate cinematic, biophilic strain visuals using best-in-class AI tools. Untapped Market's growers and content team plug straight in."
      />
    </div>
  );
}
