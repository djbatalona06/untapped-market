import type { Strain } from '../types';
import { useStore } from '../store/useStore';

function typeBadgeClass(type: Strain['type'], chemotype: string): string {
  if (chemotype.startsWith('Type III')) return 'badge badge-cbd';
  if (type === 'indica') return 'badge badge-indica';
  if (type === 'sativa') return 'badge badge-sativa';
  return 'badge badge-hybrid';
}

export function StrainCard({ strain }: { strain: Strain }) {
  const navigate = useStore((s) => s.navigate);
  const bookmarks = useStore((s) => s.bookmarks);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const addToast = useStore((s) => s.addToast);
  const bookmarked = bookmarks.has(strain.id);

  return (
    <div
      className="strain-card"
      onClick={() => navigate({ page: 'strain', id: strain.id })}
    >
      <div className="strain-card-stripe" style={{ background: strain.color }} />
      <div className="strain-card-body">
        <div className="strain-card-header">
          <div className="strain-card-name">{strain.name}</div>
          <button
            className={`bookmark-btn${bookmarked ? ' active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              const added = toggleBookmark(strain.id);
              addToast(added ? 'Bookmarked' : 'Removed bookmark');
            }}
            aria-label="Bookmark"
          >
            {bookmarked ? '★' : '☆'}
          </button>
        </div>
        <div className="row" style={{ gap: '0.4rem' }}>
          <span className={typeBadgeClass(strain.type, strain.chemotype)}>{strain.type}</span>
          <span className="muted" style={{ fontSize: '0.78rem' }}>{strain.chemotype}</span>
        </div>
        <div className="strain-card-stats">
          <span className="strain-card-stat">THC {strain.thc}%</span>
          <span className="strain-card-stat">CBD {strain.cbd}%</span>
        </div>
        <p className="strain-card-desc">{strain.description}</p>
        <div className="strain-card-foot">
          <span>❤ {strain.likeCount.toLocaleString()}</span>
          <span>{strain.dispensaryIds.length} shops</span>
        </div>
      </div>
    </div>
  );
}
