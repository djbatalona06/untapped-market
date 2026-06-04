import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { DISPENSARIES } from '../data/dispensaries';
import { DispensaryMap } from '../components/DispensaryMap';
import { BottomDrawer } from '../components/BottomDrawer';
import { STRAINS } from '../data/strains';
import type { Dispensary } from '../types';

function score(d: Dispensary, q: string): number {
  if (!q) return 0;
  const lower = q.toLowerCase();
  if (d.name.toLowerCase().includes(lower)) return 10;
  if (d.city.toLowerCase().includes(lower)) return 7;
  if (d.zip.includes(lower)) return 6;
  if (d.address.toLowerCase().includes(lower)) return 4;
  const strains = d.strainIds
    .map((sid) => STRAINS.find((s) => s.id === sid)?.name.toLowerCase() ?? '')
    .join(' ');
  if (strains.includes(lower)) return 5;
  return 0;
}

function DispListItem({ d, selected, onSelect }: { d: Dispensary; selected: boolean; onSelect: () => void }) {
  return (
    <div className={`disp-card${selected ? ' selected' : ''}`} onClick={onSelect}>
      <div className="disp-card-name">{d.name}</div>
      <div className="disp-card-meta">
        {d.address}, {d.city}, {d.state} {d.zip}
      </div>
      <div className="disp-card-meta">
        ★ {d.rating} · {d.reviewCount} reviews · {d.hours}
      </div>
      <div className="disp-card-tags">
        {(d.tags ?? []).map((t) => (
          <span key={t} className="tag-chip">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FinderPage() {
  const route = useStore((s) => s.route);
  const initialId = route.page === 'finder' ? route.dispensaryId : undefined;
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState<string>('All');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cities = useMemo(() => {
    const set = new Set(DISPENSARIES.map((d) => d.city));
    return ['All', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let list = DISPENSARIES;
    if (city !== 'All') list = list.filter((d) => d.city === city);
    if (query) {
      list = list
        .map((d) => ({ d, s: score(d, query) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.d);
    } else {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [query, city]);

  const selected = filtered.find((d) => d.id === selectedId) ?? DISPENSARIES.find((d) => d.id === selectedId);

  return (
    <div className="page" style={{ padding: 0 }}>
      <div className="finder-shell" style={{ paddingTop: 'var(--nav-h)' }}>
        <aside className="finder-list">
          <div className="finder-search">
            <input
              placeholder="Search shop, city, or zip…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-chip-row" style={{ marginBottom: 12 }}>
            {cities.slice(0, 8).map((c) => (
              <button
                key={c}
                className={`filter-chip${city === c ? ' active' : ''}`}
                onClick={() => setCity(c)}
              >
                {c}
              </button>
            ))}
            <button
              className="filter-chip"
              onClick={() => setDrawerOpen(true)}
              title="See all cities"
            >
              + {cities.length - 8} more
            </button>
          </div>
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
            {filtered.length} dispensar{filtered.length === 1 ? 'y' : 'ies'}{' '}
            {city !== 'All' ? `in ${city}` : 'across the Seattle metro'}
          </p>
          {filtered.slice(0, 60).map((d) => (
            <DispListItem
              key={d.id}
              d={d}
              selected={d.id === selectedId}
              onSelect={() => setSelectedId(d.id)}
            />
          ))}
        </aside>
        <div className="finder-map">
          <DispensaryMap
            dispensaries={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
      <BottomDrawer
        open={drawerOpen}
        title="All cities"
        onClose={() => setDrawerOpen(false)}
      >
        <div className="filter-chip-row">
          {cities.map((c) => (
            <button
              key={c}
              className={`filter-chip${city === c ? ' active' : ''}`}
              onClick={() => {
                setCity(c);
                setDrawerOpen(false);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {selected && (
          <div style={{ marginTop: 18 }}>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', marginBottom: 8 }}>
              {selected.name}
            </h3>
            <p className="muted" style={{ fontSize: '0.88rem' }}>
              {selected.address}, {selected.city} · {selected.phone}
            </p>
            <a
              className="btn"
              style={{ marginTop: 12, display: 'inline-block' }}
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coordinates.lat},${selected.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
            </a>
          </div>
        )}
      </BottomDrawer>
    </div>
  );
}
