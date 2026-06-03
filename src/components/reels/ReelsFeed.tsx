import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { useReels } from '../../lib/reels';
import { ReelCard } from './ReelCard';
import { ReelComposer } from './ReelComposer';

export function ReelsFeed() {
  const navigate = useStore((s) => s.navigate);
  const { reels, post, isLive } = useReels();
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="rl-root">
      {/* Immersive header */}
      <header className="rl-header">
        <div className="rl-header-title">
          <span className="rl-flag" aria-hidden="true" />
          <h1>Vibes</h1>
        </div>
        <div className="rl-header-actions">
          <button
            className="rl-header-quiz"
            onClick={() => navigate({ page: 'quiz' })}
            aria-label="Open the AI strain match"
          >
            ✨ AI Match
          </button>
          <button
            className="rl-header-post"
            onClick={() => setComposerOpen(true)}
            aria-label="Post a reel"
          >
            <span aria-hidden="true">＋</span> Post
          </button>
        </div>
      </header>

      <div className="rl-feed" role="feed" aria-label="Reels — one love feed">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} />
        ))}
      </div>

      <ReelComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPost={post}
        isLive={isLive}
      />
    </div>
  );
}
