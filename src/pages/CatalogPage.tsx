import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { StrainCard } from '../components/StrainCard';
import { BottomDrawer } from '../components/BottomDrawer';
import type { Strain, StrainType } from '../types';

const TYPE_OPTIONS: Array<StrainType | 'all'> = ['all', 'sativa', 'indica', 'hybrid'];
const ALL_EFFECTS = [
  'Euphoric',
  'Creative',
  'Focused',
  'Energetic',
  'Relaxed',
  'Sleepy',
  'Happy',
  'Uplifted',
  'Hungry',
  'Tingly',
  'Calm',
  'Pain relief',
  'Clear-headed',
  'Talkative',
];

const PAGE_SIZE = 24;
const ALL_FLAVORS = [
  'Citrus',
  'Pine',
  'Earthy',
  'Diesel',
  'Sweet',
  'Berry',
  'Floral',
  'Herbal',
  'Tropical',
];

interface Filters {
  type: StrainType | 'all';
  thcMax: number;
  cbdMin: number;
  effects: Set<string>;
  flavors: Set<string>;
  query: string;
}

const DEFAULT_FILTERS: Filters = {
  type: 'all',
  thcMax: 35,
  cbdMin: 0,
  effects: new Set(),
  flavors: new Set(),
  query: '',
};

function applyFilters(strains: Strain[], f: Filters): Strain[] {
  return strains.filter((s) => {
    if (f.type !== 'all' && s.type !== f.type) return false;
    if (s.thc > f.thcMax) return false;
    if (s.cbd < f.cbdMin) return false;
    if (f.effects.size && !Array.from(f.effects).every((e) => s.effects.includes(e))) return false;
    if (f.flavors.size && !Array.from(f.flavors).some((fl) => s.flavors.includes(fl))) return false;
    if (f.query) {
      const q = f.query.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.description.toLowerCase().includes(q) &&
        !s.flavors.some((fl) => fl.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });
}

function FilterPanel({ f, setF }: { f: Filters; setF: (next: Filters) => void }) {
  function toggleSet(key: 'effects' | 'flavors', value: string) {
    const next = new Set(f[key]);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setF({ ...f, [key]: next });
  }
  return (
    <>
      <div className="filter-group">
        <label className="filter-label">Search</label>
        <input
          className="auth-input"
          placeholder="strain, flavor…"
          value={f.query}
          onChange={(e) => setF({ ...f, query: e.target.value })}
          style={{ marginBottom: 0 }}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Type</label>
        <div className="filter-chip-row">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              className={`filter-chip${f.type === t ? ' active' : ''}`}
              onClick={() => setF({ ...f, type: t })}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-label">Max THC: {f.thcMax}%</label>
        <input
          type="range"
          className="range-input"
          min={5}
          max={35}
          value={f.thcMax}
          onChange={(e) => setF({ ...f, thcMax: Number(e.target.value) })}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Min CBD: {f.cbdMin}%</label>
        <input
          type="range"
          className="range-input"
          min={0}
          max={20}
          value={f.cbdMin}
          onChange={(e) => setF({ ...f, cbdMin: Number(e.target.value) })}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Effects</label>
        <div className="filter-chip-row">
          {ALL_EFFECTS.map((e) => (
            <button
              key={e}
              className={`filter-chip${f.effects.has(e) ? ' active' : ''}`}
              onClick={() => toggleSet('effects', e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-label">Flavors</label>
        <div className="filter-chip-row">
          {ALL_FLAVORS.map((fl) => (
            <button
              key={fl}
              className={`filter-chip${f.flavors.has(fl) ? ' active' : ''}`}
              onClick={() => toggleSet('flavors', fl)}
            >
              {fl}
            </button>
          ))}
        </div>
      </div>
      <button className="btn btn-ghost" onClick={() => setF({ ...DEFAULT_FILTERS })}>
        Reset filters
      </button>
    </>
  );
}

export function CatalogPage() {
  const route = useStore((s) => s.route);
  const initialQuery = route.page === 'catalog' ? route.query ?? '' : '';
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS, query: initialQuery });
  const [drawer, setDrawer] = useState(false);
  // How many cards are rendered; grows via "Load more". Reset whenever filters change
  // so the catalog can scale to ~1k strains without mounting them all at once.
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (route.page === 'catalog' && route.query !== undefined) {
      setFilters((f) => ({ ...f, query: route.query ?? '' }));
    }
  }, [route]);

  const results = useMemo(() => applyFilters(STRAINS, filters), [filters]);
  useEffect(() => setVisible(PAGE_SIZE), [filters]);
  const shown = results.slice(0, visible);

  return (
    <div className="page">
      <header className="page-header">
        <h1>
          The <em>strain</em> library
        </h1>
        <p>Filter {STRAINS.length} cultivars by chemotype, terpene profile, effect, and flavor.</p>
      </header>
      <div className="catalog-layout">
        <aside className="catalog-filters">
          <FilterPanel f={filters} setF={setFilters} />
        </aside>
        <div>
          <div
            className="row"
            style={{ marginBottom: 16, justifyContent: 'space-between' }}
          >
            <span className="muted" style={{ fontSize: '0.88rem' }}>
              {results.length} strain{results.length === 1 ? '' : 's'} match
            </span>
          </div>
          {results.length === 0 ? (
            <div className="section-card" style={{ textAlign: 'center' }}>
              <p className="muted">No strains match these filters yet — try widening your THC range or removing an effect.</p>
            </div>
          ) : (
            <>
              <div className="strain-grid">
                {shown.map((s) => (
                  <StrainCard key={s.id} strain={s} />
                ))}
              </div>
              {visible < results.length && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button className="btn btn-ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    Load more — showing {shown.length} of {results.length}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <button
        className="mobile-filter-fab"
        onClick={() => setDrawer(true)}
        aria-label="Filters"
      >
        🎚 Filters
      </button>
      <BottomDrawer open={drawer} title="Filter strains" onClose={() => setDrawer(false)}>
        <FilterPanel f={filters} setF={setFilters} />
        <div style={{ marginTop: 18 }}>
          <button className="btn" onClick={() => setDrawer(false)} style={{ width: '100%' }}>
            Show {results.length} strains
          </button>
        </div>
      </BottomDrawer>
    </div>
  );
}
