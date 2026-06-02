import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DISPENSARIES, STRAINS } from '@/store';
import DispensaryMap from '@/components/DispensaryMap';

type StateFilter = 'all' | 'WA' | 'OR';

export default function FinderPage() {
  const [stateFilter, setStateFilter] = useState<StateFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      stateFilter === 'all'
        ? DISPENSARIES
        : DISPENSARIES.filter((d) => d.state === stateFilter),
    [stateFilter]
  );

  return (
    <div className="page">
      <div className="finder-page">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1
            style={{
              fontFamily: 'DM Serif Display',
              fontStyle: 'italic',
              fontSize: '2rem',
              color: 'var(--text)',
              marginBottom: '0.3rem',
            }}
          >
            Dispensary Finder
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            PNW-only licensed dispensaries — Washington &amp; Oregon.
          </p>
        </div>

        <DispensaryMap
          dispensaries={filtered}
          selected={selected}
          onSelect={setSelected}
        />

        <div className="state-filter" role="tablist" aria-label="Filter by state">
          {([
            ['all', 'All States'],
            ['WA', 'Washington'],
            ['OR', 'Oregon'],
          ] as [StateFilter, string][]).map(([val, label]) => (
            <button
              key={val}
              role="tab"
              aria-selected={stateFilter === val}
              className={`type-tab${stateFilter === val ? ' active' : ''}`}
              onClick={() => setStateFilter(val)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="dispensary-grid">
          {filtered.map((d) => {
            const strains = STRAINS.filter((s) => d.strainIds.includes(s.id));
            const isSelected = d.id === selected;
            return (
              <div
                key={d.id}
                className="dispensary-card"
                onClick={() => setSelected(d.id)}
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'rgba(196,131,26,.55)' : undefined,
                  boxShadow: isSelected ? 'var(--glow-amber)' : undefined,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
              >
                <div className="dispensary-header">
                  <div>
                    <div className="dispensary-name">{d.name}</div>
                    <div className="dispensary-meta">
                      {d.address}, {d.city} {d.state}
                    </div>
                  </div>
                  <span className="rating">★ {d.rating}</span>
                </div>
                <div className="dispensary-meta">{d.hours}</div>
                <div className="dispensary-meta" style={{ marginTop: '0.25rem' }}>
                  {d.phone}
                </div>
                <div className="strain-chips">
                  {strains.map((s) => (
                    <Link
                      key={s.id}
                      to={`/strain/${s.id}`}
                      className="strain-chip"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
