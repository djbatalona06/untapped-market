import type { Strain } from '../types';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { resolveStrainImage } from '../lib/strainArt';

type TintKey = 'sativa' | 'indica' | 'hybrid' | 'cbd';

function tintFor(strain: Strain): TintKey {
  if (strain.chemotype.startsWith('Type II') || strain.chemotype.startsWith('Type III')) return 'cbd';
  if (strain.cbd >= 5) return 'cbd';
  if (strain.type === 'sativa') return 'sativa';
  if (strain.type === 'indica') return 'indica';
  return 'hybrid';
}

function badgeClass(tint: TintKey): string {
  switch (tint) {
    case 'sativa':
      return 'badge badge-sativa';
    case 'indica':
      return 'badge badge-indica';
    case 'cbd':
      return 'badge badge-cbd';
    default:
      return 'badge badge-hybrid';
  }
}

export function StrainCard({ strain }: { strain: Strain }) {
  const navigate = useStore((s) => s.navigate);
  const bookmarks = useStore((s) => s.bookmarks);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const addToast = useStore((s) => s.addToast);
  // Approved Supabase media wins; fall back to a bundled imageUrl, then to the art.
  const mediaUrl = useStore((s) => s.strainMedia[strain.id]);
  const bookmarked = bookmarks.has(strain.id);
  const tint = tintFor(strain);
  const dropNo = String(STRAINS.findIndex((s) => s.id === strain.id) + 1).padStart(2, '0');
  // Always resolves to something: Supabase media → bundled imageUrl → generated
  // per-strain art. Never falls through to a single shared placeholder photo.
  const resolvedImage = resolveStrainImage(strain, mediaUrl);
  const cardImage = `url("${resolvedImage}")`;
  // Imported reference strains carry no trustworthy lab numbers (thc/cbd = 0).
  // Show an honest "—" rather than a fabricated "0%".
  const unknownPotency = strain.thc === 0 && strain.cbd === 0;

  return (
    <div
      className="strain-card reveal-card"
      data-tint={tint}
      onClick={() => navigate({ page: 'strain', id: strain.id })}
      style={{ ['--card-image' as string]: cardImage } as React.CSSProperties}
    >
      <div className="strain-card-art" aria-hidden="true">
        <div className="strain-card-art-inner">
          <div className="strain-card-art-top">
            <span className="strain-card-art-label">Nº {dropNo}</span>
            <button
              className={`bookmark-btn${bookmarked ? ' active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                const added = toggleBookmark(strain.id);
                addToast(added ? 'Saved to library ✓' : 'Removed from library');
              }}
              aria-label="Bookmark strain"
            >
              {bookmarked ? '♥' : '♡'}
            </button>
          </div>
          <div className="strain-card-art-bottom">
            <span className="strain-dot" style={{ color: strain.color, background: strain.color }} />
            <span className={badgeClass(tint)}>{tint}</span>
          </div>
        </div>
      </div>
      <div className="strain-card-body">
        <div className="strain-card-name">{strain.name}</div>
        <p className="strain-card-desc">{strain.description}</p>
        <div className="strain-card-stats">
          <span>
            THC<b>{unknownPotency ? '—' : `${strain.thc}%`}</b>
          </span>
          <span>
            CBD<b>{unknownPotency ? '—' : `${strain.cbd}%`}</b>
          </span>
          <span>
            ♥<b>{strain.likeCount.toLocaleString()}</b>
          </span>
        </div>
        <div className="strain-card-pills">
          {strain.terpenes.slice(0, 2).map((t) => (
            <span key={t.name} className="terpene-pill">
              {t.name}
            </span>
          ))}
        </div>
        <div className="strain-card-pills">
          {strain.effects.slice(0, 3).map((e) => (
            <span key={e} className="effect-tag">
              {e}
            </span>
          ))}
        </div>
        <div className="strain-card-foot">View Details →</div>
      </div>
    </div>
  );
}
