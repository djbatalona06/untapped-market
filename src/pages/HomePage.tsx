import { useState, type FormEvent } from 'react';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { StrainCard } from '../components/StrainCard';
import type { Strain } from '../types';

const MARQUEE_ITEMS = [
  'Cascadia Haze',
  'Trichome density',
  'Rainier Kush',
  'Terpinolene',
  'Hood River Haze',
  'Pacific Northwest',
  'Olympic Fog',
  'Myrcene · Linalool',
  'Lab-verified COAs',
  'Limonene',
  'Volume 02',
];

function CineHero() {
  const navigate = useStore((s) => s.navigate);
  const [query, setQuery] = useState('');

  function onSearch(e: FormEvent) {
    e.preventDefault();
    navigate({ page: 'catalog', query: query.trim() || undefined });
  }

  return (
    <section className="cine-hero">
      <div
        className="cine-hero-img ambient"
        data-parallax="0.15"
        data-parallax-scale="1.12"
        aria-hidden="true"
      />
      <div className="cine-hero-vignette" aria-hidden="true" />
      <div className="cine-hero-grain" aria-hidden="true" />

      <div className="cine-hero-meta">
        <span>Vol. 02 · Spring '26</span>
        <span className="cine-hero-meta-divider" aria-hidden="true" />
        <span>WA · OR · 47.6062°N</span>
      </div>

      <div className="cine-hero-inner">
        <div className="cine-hero-eyebrow">The PNW Cannabis Almanac</div>
        <h1>
          <span className="line l1">
            <span>
              Know what's <em>actually</em>
            </span>
          </span>
          <span className="line l2">
            <span>in the jar.</span>
          </span>
        </h1>
        <p className="cine-hero-sub">
          A field guide to Pacific Northwest cannabis — strain genetics, terpene chemistry,
          and verified dispensary inventory, written for people who care what they're
          putting in their lungs.
        </p>
        <form className="cine-search" onSubmit={onSearch}>
          <input
            type="text"
            placeholder="Search strains, terpenes, effects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search ↗</button>
        </form>
        <div className="cine-hero-actions">
          <button className="btn-cine" onClick={() => navigate({ page: 'catalog' })}>
            Browse the catalog
          </button>
          <button className="btn-cine-ghost" onClick={() => navigate({ page: 'finder' })}>
            Find a dispensary
          </button>
        </div>
      </div>

      <div className="cine-hero-scroll" aria-hidden="true">
        Scroll
      </div>
    </section>
  );
}

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="cine-marquee" aria-hidden="true">
      <div className="cine-marquee-track">
        {items.map((t, i) => (
          <span key={i} className="cine-marquee-item">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function TheDrop({ strain }: { strain: Strain }) {
  const navigate = useStore((s) => s.navigate);
  const nameParts = strain.name.split(' ');
  const lead = nameParts.slice(0, -1).join(' ');
  const last = nameParts.at(-1) ?? '';
  const dominant = strain.terpenes[0]?.name ?? '—';

  return (
    <section className="cine-drop">
      <div className="cine-drop-img" aria-hidden="true">
        <div className="cine-drop-img-inner" data-parallax="0.08" />
        <span className="cine-drop-img-label">Drop №01 · Apothecary Series</span>
      </div>
      <div className="cine-drop-body">
        <div className="eyebrow-mono reveal">The Drop · This Week</div>
        <h3 className="reveal reveal-delay-1">
          {lead} <em>{last}</em>
        </h3>
        <p className="reveal reveal-delay-2">{strain.description}</p>
        <div className="cine-drop-meta-grid reveal reveal-delay-3">
          <div>
            <span className="k">Type</span>
            <span className="v">{strain.type}</span>
          </div>
          <div>
            <span className="k">THC</span>
            <span className="v">{strain.thc}%</span>
          </div>
          <div>
            <span className="k">Dominant</span>
            <span className="v">{dominant.slice(0, 8)}</span>
          </div>
        </div>
        <div className="reveal reveal-delay-4" style={{ marginTop: '0.5rem' }}>
          <button
            className="btn-cine"
            onClick={() => navigate({ page: 'strain', id: strain.id })}
          >
            Read the profile →
          </button>
        </div>
      </div>
    </section>
  );
}

function StrainChapter({
  chapter,
  heading,
  emphasis,
  counter,
  ctaLabel,
  strains,
}: {
  chapter: string;
  heading: string;
  emphasis: string;
  counter: string;
  ctaLabel: string;
  strains: Strain[];
}) {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="cine-section">
      <div className="cine-section-head reveal">
        <div>
          <div className="eyebrow-mono" style={{ marginBottom: '0.75rem' }}>
            {chapter}
          </div>
          <h2>
            {heading} <em>{emphasis}</em>
          </h2>
        </div>
        <div className="cine-section-head-meta">
          {counter}
          <a onClick={() => navigate({ page: 'catalog' })}>{ctaLabel}</a>
        </div>
      </div>
      <div className="strain-grid">
        {strains.map((s) => (
          <StrainCard key={s.id} strain={s} />
        ))}
      </div>
    </section>
  );
}

function SmokeInterstitial() {
  return (
    <section className="cine-smoke" aria-label="Editorial quote">
      <div
        className="cine-smoke-bg"
        data-parallax="0.12"
        data-parallax-scale="1.18"
        aria-hidden="true"
      />
      <div className="cine-smoke-bg-2" aria-hidden="true" />
      <div className="cine-smoke-inner reveal">
        <blockquote>
          “Cannabis is a plant first, a product second. We read it the way a
          sommelier reads a vineyard — by terroir, by chemistry, by hand.”
        </blockquote>
        <cite>— Editor's Note, Vol. 02</cite>
      </div>
    </section>
  );
}

function FieldReports() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="cine-stories">
      <div className="cine-stories-body">
        <div className="eyebrow-mono reveal">Field Reports</div>
        <h3 className="reveal reveal-delay-1">
          The people who <em>actually</em> know.
        </h3>
        <p className="reveal reveal-delay-2">
          Twelve thousand trip reports and counting — written by growers, budtenders,
          and weekend ritualists across Washington and Oregon. Filter by method,
          by mood, by time of day. Real notes, no marketing copy.
        </p>
        <div className="reveal reveal-delay-3" style={{ marginTop: '0.5rem' }}>
          <button className="btn-cine-ghost" onClick={() => navigate({ page: 'library' })}>
            Browse field reports →
          </button>
        </div>
      </div>
      <div className="cine-stories-img" aria-hidden="true">
        <div className="cine-stories-img-inner" data-parallax="0.06" />
        <span className="cine-stories-img-label">Cabin near Mt. Baker · 7:42pm</span>
      </div>
    </section>
  );
}

function PnwSpotlight() {
  const navigate = useStore((s) => s.navigate);
  return (
    <section className="spotlight">
      <div className="spotlight-inner">
        <div className="reveal-left">
          <div className="eyebrow-mono" style={{ marginBottom: '1rem' }}>
            The Region
          </div>
          <h2>
            Built for the <em>Pacific Northwest.</em>
          </h2>
          <p>
            We focus exclusively on WA and OR — the two most mature legal markets on the
            West Coast. Every strain, every dispensary, every lab cert comes from within
            the region.
          </p>
          <button
            className="btn-cine-ghost"
            onClick={() => navigate({ page: 'finder' })}
            style={{ marginTop: '1.25rem' }}
          >
            Find dispensaries near you →
          </button>
        </div>
        <div className="stats-grid reveal-right">
          <div className="stat-block">
            <div className="num">200+</div>
            <div className="label">Strains</div>
          </div>
          <div className="stat-block">
            <div className="num">47</div>
            <div className="label">Dispensaries</div>
          </div>
          <div className="stat-block">
            <div className="num">12k+</div>
            <div className="label">Trip reports</div>
          </div>
          <div className="stat-block">
            <div className="num">02</div>
            <div className="label">States</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CineFooter() {
  return (
    <footer className="cine-footer">
      <div className="cine-footer-inner reveal">
        <div className="cine-footer-wordmark">
          Untapped
          <br />
          <em>Market.</em>
        </div>
        <div className="cine-footer-meta">
          © 2026 · Vol. 02
          <br />
          WA · OR · CAN
          <br />
          21+ · Consume responsibly
          <br />
          <span style={{ color: 'var(--ember)' }}>Made in Cascadia</span>
        </div>
      </div>
    </footer>
  );
}

export function HomePage() {
  const trending = [...STRAINS].sort((a, b) => b.likeCount - a.likeCount).slice(0, 3);
  const staffPicks = STRAINS.slice(0, 3);
  const drop = trending[0];

  return (
    <div className="page">
      <CineHero />
      <Marquee />
      {drop && <TheDrop strain={drop} />}
      <StrainChapter
        chapter="Chapter I"
        heading="Staff picks,"
        emphasis="this rotation."
        counter={`03 / ${STRAINS.length} strains`}
        ctaLabel="View all →"
        strains={staffPicks}
      />
      <SmokeInterstitial />
      <FieldReports />
      <StrainChapter
        chapter="Chapter II"
        heading="Trending"
        emphasis="this week."
        counter="Updated Mondays"
        ctaLabel="See full chart →"
        strains={trending}
      />
      <PnwSpotlight />
      <CineFooter />
    </div>
  );
}
