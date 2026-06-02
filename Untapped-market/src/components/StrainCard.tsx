import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight } from 'lucide-react';
import type { Strain } from '@/store/types';
import { cn } from '@/lib/utils';

interface Props {
  strain: Strain;
  onToggleBookmark?: () => void;
  isBookmarked?: boolean;
}

const typeBadgeClass: Record<string, string> = {
  indica: 'badge badge-indica',
  sativa: 'badge badge-sativa',
  hybrid: 'badge badge-hybrid',
  cbd: 'badge badge-cbd',
};

const typeDotColor: Record<string, string> = {
  indica: '#c08ce8',
  sativa: '#8ED68A',
  hybrid: '#D9A55C',
  cbd: '#7ec0d8',
};

export default function StrainCard({ strain, onToggleBookmark, isBookmarked }: Props) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const type = (strain.type ?? 'hybrid').toLowerCase();
  const dotColor = typeDotColor[type] ?? typeDotColor.hybrid;
  const badgeCls = typeBadgeClass[type] ?? typeBadgeClass.hybrid;

  const topTerpenes = (strain.terpenes ?? []).slice(0, 2);
  const topEffects = (strain.effects ?? []).slice(0, 3);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleBookmark?.();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const wrapper = el.querySelector('.strain-card-art-img-wrapper') as HTMLElement;
    if (wrapper) {
      const rx = (y - 0.5) * -16;
      const ry = (x - 0.5) * 16;
      wrapper.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.12, 1.12, 1.12)`;
    }
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    const wrapper = el.querySelector('.strain-card-art-img-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.style.transform = '';
    }
  };

  return (
    <Link
      ref={cardRef}
      to={`/strain/${strain.id}`}
      className="strain-card reveal-card"
      data-tint={type}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="strain-card-art" aria-hidden="true">
        <div className="strain-card-art-img-wrapper" />
        <div className="strain-card-art-inner">
          <div className="strain-card-top">
            <span
              className="strain-dot"
              style={{ color: dotColor }}
            />
            <span className={badgeCls}>{type}</span>
            {strain.is_legacy && (
              <span className="badge badge-amber" style={{ marginLeft: '4px' }}>
                OG Legacy
              </span>
            )}
            {strain.source_state && (
              <span className="badge badge-accent" style={{ marginLeft: '4px' }}>
                {strain.source_state} Grown
              </span>
            )}
            {onToggleBookmark && (
              <button
                type="button"
                className={cn('bookmark-btn', isBookmarked && 'bookmarked')}
                onClick={handleBookmark}
                aria-label={isBookmarked ? 'Remove from library' : 'Save to library'}
                aria-pressed={!!isBookmarked}
              >
                <Bookmark
                  size={14}
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
          <span className="strain-card-art-label">
            Nº {strain.id.substring(0, 2).toUpperCase() || '00'}
          </span>
        </div>
      </div>

      <div className="strain-card-body">
        <h3 className="strain-name">{strain.name}</h3>
        <p className="strain-desc">{strain.description}</p>

        <div className="strain-stats">
          <span className="stat-item">
            THC <span>{strain.thc?.toFixed(1)}%</span>
          </span>
          <span className="stat-item">
            CBD <span>{strain.cbd?.toFixed(1)}%</span>
          </span>
          {typeof strain.likeCount === 'number' && (
            <span className="stat-item">
              ♡ <span>{strain.likeCount.toLocaleString()}</span>
            </span>
          )}
        </div>

        {topTerpenes.length > 0 && (
          <div className="terpene-pills">
            {topTerpenes.map((t) => (
              <span key={t.name} className="terpene-pill">
                {t.name}
              </span>
            ))}
          </div>
        )}

        {topEffects.length > 0 && (
          <div className="effect-tags">
            {topEffects.map((e) => (
              <span key={e} className="effect-tag">
                {e}
              </span>
            ))}
          </div>
        )}

        <div className="card-footer">
          View Details <ChevronRight size={14} style={{ marginLeft: '2px', display: 'inline-block' }} />
        </div>
      </div>
    </Link>
  );
}
