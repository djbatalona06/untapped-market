import type { CSSProperties } from 'react';
import { STORY_AVATARS } from '../../data/socialFeed';

export function StoriesRow() {
  return (
    <div className="sf-stories-outer" role="list" aria-label="Brand stories">
      <div className="sf-stories-track">
        {STORY_AVATARS.map((s) => (
          <button
            key={s.id}
            className="sf-story-btn"
            role="listitem"
            aria-label={`${s.label} story`}
            style={
              {
                '--ring-start': s.gradientStart,
                '--ring-end': s.gradientEnd,
              } as CSSProperties
            }
          >
            <span className="sf-story-ring">
              <span className="sf-story-inner">
                <span className="sf-story-emoji" aria-hidden="true">
                  {s.emoji}
                </span>
              </span>
            </span>
            <span className="sf-story-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
