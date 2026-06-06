import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { DISPENSARIES } from '../data/dispensaries';
import { DispensaryMap } from '../components/DispensaryMap';
import { STRAINS } from '../data/strains';
import type { Dispensary } from '../types';
import {
  COUNTY_FILTER_OPTIONS,
  COUNTY_BY_CODE,
  queryByCounty,
  type CountySelection,
} from '../lib/counties';

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
        {d.county ? ` · ${d.county} County` : ''}
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
  // County is the primary geographic filter. A specific county never leaks the
  // other counties — only "All" returns everything (see queryByCounty).
  const [county, setCounty] = useState<CountySelection>('All');

  const filtered = useMemo(() => {
    let list = queryByCounty(DISPENSARIES, county);
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
  }, [query, county]);

  const selected = filtered.find((d) => d.id === selectedId) ?? DISPENSARIES.find((d) => d.id === selectedId);
  const countyLabel = typeof county === 'string' ? COUNTY_BY_CODE[county]?.name : undefined;

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
            {COUNTY_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                className={`filter-chip${county === opt.value ? ' active' : ''}`}
                onClick={() => setCounty(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 12 }}>
            {filtered.length} dispensar{filtered.length === 1 ? 'y' : 'ies'}{' '}
            {county !== 'All' && countyLabel ? `in ${countyLabel} County` : 'across the Puget Sound region'}
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
      {selected && (
        <div className="finder-selected-bar">
          <div>
            <strong>{selected.name}</strong>
            <span className="muted">
              {' '}— {selected.address}, {selected.city} · {selected.phone}
            </span>
          </div>
          <a
            className="btn"
            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coordinates.lat},${selected.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
          </a>
        </div>
      )}
    </div>
  );
}
