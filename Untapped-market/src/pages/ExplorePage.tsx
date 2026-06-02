import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { STRAINS } from '@/store';

type Category = 'All' | 'Science' | 'PNW' | 'How-To' | 'Terpenes';

interface MediaCard {
  id: string;
  title: string;
  category: Exclude<Category, 'All'>;
  date: string;
  image: string;
  href: string; // internal "/strain/:id" or external URL
  external?: boolean;
}

// V1 todo #9.9 — real Unsplash imagery + linked content + category filter tabs.
const MEDIA: MediaCard[] = [
  {
    id: 'm1',
    title: 'How terpenes shape the high — the science of myrcene & limonene',
    category: 'Terpenes',
    date: 'May 2026',
    image:
      'https://images.unsplash.com/photo-1536819114556-1e10f967fb61?auto=format&fit=crop&w=600&q=80',
    href: '/strain/cascadia-haze',
  },
  {
    id: 'm2',
    title: 'Inside a Cascadia indoor grow — Olympia, WA',
    category: 'PNW',
    date: 'Apr 2026',
    image:
      'https://images.unsplash.com/photo-1605198179057-3a7e6dca5f17?auto=format&fit=crop&w=600&q=80',
    href: '/finder',
  },
  {
    id: 'm3',
    title: 'What a Type II chemotype actually tells you',
    category: 'Science',
    date: 'Apr 2026',
    image:
      'https://images.unsplash.com/photo-1471919743851-c4df8b6ee133?auto=format&fit=crop&w=600&q=80',
    href: '/strain/puget-sound-cbd',
  },
  {
    id: 'm4',
    title: 'Reading a Certificate of Analysis — a 5-minute guide',
    category: 'How-To',
    date: 'Apr 2026',
    image:
      'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?auto=format&fit=crop&w=600&q=80',
    href: 'https://www.confidenceanalytics.com/learn/coa',
    external: true,
  },
  {
    id: 'm5',
    title: 'Hood River Haze: meet the grower behind PNW’s breakout sativa',
    category: 'PNW',
    date: 'Mar 2026',
    image:
      'https://images.unsplash.com/photo-1502884999894-92e2c0e57bcc?auto=format&fit=crop&w=600&q=80',
    href: '/strain/hood-river-haze',
  },
  {
    id: 'm6',
    title: 'Linalool deep-dive: the calming terpene shared with lavender',
    category: 'Terpenes',
    date: 'Mar 2026',
    image:
      'https://images.unsplash.com/photo-1469289759076-d1484757abc4?auto=format&fit=crop&w=600&q=80',
    href: '/strain/rainier-kush',
  },
  {
    id: 'm7',
    title: 'Decoding lineage: why landrace strains still matter',
    category: 'Science',
    date: 'Feb 2026',
    image:
      'https://images.unsplash.com/photo-1611232658409-0d98127f237f?auto=format&fit=crop&w=600&q=80',
    href: '/strain/willamette-valley-og',
  },
  {
    id: 'm8',
    title: 'A first-timer’s guide to flower vs vape vs edible',
    category: 'How-To',
    date: 'Feb 2026',
    image:
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    href: '/catalog',
  },
];

const CATEGORIES: Category[] = ['All', 'Science', 'PNW', 'How-To', 'Terpenes'];

function typeBadgeClass(type: string) {
  return `badge badge-${type}`;
}

export default function ExplorePage() {
  const [category, setCategory] = useState<Category>('All');

  const filtered = useMemo(
    () => (category === 'All' ? MEDIA : MEDIA.filter((m) => m.category === category)),
    [category]
  );

  return (
    <div className="page">
      <div className="explore-page">
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'DM Serif Display',
              fontStyle: 'italic',
              fontSize: '2rem',
              color: 'var(--text)',
              marginBottom: '0.3rem',
            }}
          >
            Explore
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            Science, stories, and strain spotlights from the Pacific Northwest.
          </p>
        </div>

        {/* V1 todo #9.9 — category filter tabs */}
        <div
          className="type-tabs"
          role="tablist"
          aria-label="Filter by category"
          style={{ marginBottom: '1.25rem' }}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              className={`type-tab${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="media-grid">
          {filtered.map((item) => {
            const inner = (
              <>
                <div
                  className="media-thumb"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  role="img"
                  aria-label={item.title}
                />
                <div className="media-body">
                  <div className="media-category">{item.category}</div>
                  <div className="media-title">{item.title}</div>
                  <div className="media-meta">{item.date}</div>
                </div>
              </>
            );
            return item.external ? (
              <a
                key={item.id}
                className="media-card"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {inner}
              </a>
            ) : (
              <Link key={item.id} className="media-card" to={item.href}>
                {inner}
              </Link>
            );
          })}
        </div>

        <div style={{ marginBottom: '1rem', marginTop: '2rem' }}>
          <h2
            className="section-title"
            style={{
              fontFamily: 'DM Serif Display',
              fontStyle: 'italic',
              fontSize: '1.4rem',
              color: 'var(--text)',
            }}
          >
            PNW Strain Spotlight
          </h2>
        </div>
        <div className="spotlight-scroll">
          {STRAINS.map((s) => (
            <Link key={s.id} to={`/strain/${s.id}`} className="spotlight-pill">
              <div className="pill-name">{s.name}</div>
              <div className="pill-sub" style={{ color: 'var(--text3)' }}>
                {s.type} · {s.thc}% THC
              </div>
              <div
                style={{
                  marginTop: '0.35rem',
                  display: 'flex',
                  gap: '0.25rem',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  className={typeBadgeClass(s.type)}
                  style={{ fontSize: '0.6rem' }}
                >
                  {s.type}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
