import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { STRAINS } from '@/store';
import StrainCard from '@/components/StrainCard';

type StrainType = 'all' | 'indica' | 'sativa' | 'hybrid';
type SortKey = 'likes' | 'thc' | 'alpha';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // V1 todo #9.7 — pre-fill search from ?q= query param.
  const initialQuery = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(initialQuery);
  const [type, setType] = useState<StrainType>('all');
  const [effect, setEffect] = useState('');
  const [minThc, setMinThc] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>('likes');

  // Mobile filter drawer (V1 todo #9.6 — filters collapse to drawer on mobile)
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep state in sync if the URL param changes (e.g. user re-enters from Home).
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setSearch(q);
  }, [searchParams]);

  const allEffects = useMemo(() => {
    const set = new Set<string>();
    STRAINS.forEach((s) => s.effects.forEach((e) => set.add(e)));
    return [...set].sort();
  }, []);

  const filtered = useMemo(() => {
    let list = [...STRAINS];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      );
    }
    if (type !== 'all') list = list.filter((s) => s.type === type);
    if (effect) list = list.filter((s) => s.effects.includes(effect));
    if (minThc > 0) list = list.filter((s) => s.thc >= minThc);
    if (sortBy === 'likes') list.sort((a, b) => b.likeCount - a.likeCount);
    else if (sortBy === 'thc') list.sort((a, b) => b.thc - a.thc);
    else list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [search, type, effect, minThc, sortBy]);

  function clearFilters() {
    setSearch('');
    setType('all');
    setEffect('');
    setMinThc(0);
    setSortBy('likes');
    // Drop the ?q= param when filters are cleared so URL reflects state.
    if (searchParams.has('q')) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next, { replace: true });
    }
  }

  const filters = (
    <div className="filter-card">
      <div className="filter-title">Filter Strains</div>
      <div className="filter-group">
        <label className="filter-group-label" htmlFor="catalog-search">
          Search
        </label>
        <input
          id="catalog-search"
          className="filter-input"
          placeholder="Name or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <div className="filter-group-label">Type</div>
        <div className="type-tabs" role="tablist">
          {(['all', 'indica', 'sativa', 'hybrid'] as StrainType[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={type === t}
              className={`type-tab${type === t ? ' active' : ''}`}
              onClick={() => setType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-group-label" htmlFor="catalog-effect">
          Effect
        </label>
        <select
          id="catalog-effect"
          className="filter-input"
          value={effect}
          onChange={(e) => setEffect(e.target.value)}
        >
          <option value="">Any effect</option>
          {allEffects.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="filter-group-label" htmlFor="catalog-thc">
          Min THC %
        </label>
        <div className="slider-wrap">
          <div className="slider-label">
            <span>0%</span>
            <span>{minThc}%</span>
          </div>
          <input
            id="catalog-thc"
            type="range"
            min={0}
            max={30}
            value={minThc}
            onChange={(e) => setMinThc(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="filter-group">
        <label className="filter-group-label" htmlFor="catalog-sort">
          Sort By
        </label>
        <select
          id="catalog-sort"
          className="filter-input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
        >
          <option value="likes">Most Liked</option>
          <option value="thc">Highest THC</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>
      <button className="btn btn-ghost w-full btn-sm" onClick={clearFilters}>
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="page">
      <div className="catalog-layout">
        <aside className="catalog-sidebar">{filters}</aside>

        {/* Mobile filter trigger (V1 todo #9.6) */}
        <button
          className="btn btn-secondary btn-sm catalog-filter-trigger"
          aria-label="Open filters"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
        >
          ☰ Filters
        </button>

        {drawerOpen && (
          <div
            className="catalog-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Filter strains"
          >
            <div
              className="catalog-filter-drawer-backdrop"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="catalog-filter-drawer-panel">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                ✕ Close
              </button>
              {filters}
            </div>
          </div>
        )}

        <main>
          <div className="results-header">
            <span className="results-count">
              {filtered.length} strain{filtered.length !== 1 ? 's' : ''} found
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="empty-library" style={{ padding: '3rem 0' }}>
              <div className="empty-icon">🔍</div>
              <h2>No strains match your filters</h2>
              <p>Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <div className="strain-grid">
              {filtered.map((s) => (
                <StrainCard key={s.id} strain={s} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
