import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  AUTHOR_BADGE,
  reelBackground,
  reelRelativeTime,
  type Reel,
} from '../../data/reels';

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

interface ReelCardProps {
  reel: Reel;
}

export function ReelCard({ reel }: ReelCardProps) {
  const addToast = useStore((s) => s.addToast);
  const [active, setActive] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [burst, setBurst] = useState(false);
  const ref = useRef<HTMLElement | null>(null);
  const lastTap = useRef(0);

  const { backgroundImage, isPhoto } = reelBackground(reel.bg);
  const badge = AUTHOR_BADGE[reel.authorType];
  const likeCount = reel.likes + (liked ? 1 : 0);

  // Mark the reel "active" while it fills the viewport — drives the Ken Burns /
  // now-playing motion so only the on-screen clip animates.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio > 0.6),
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function triggerLike(viaDoubleTap: boolean) {
    setLiked((prev) => {
      if (viaDoubleTap && prev) return prev; // double-tap never un-likes
      const next = viaDoubleTap ? true : !prev;
      if (next && !prev) {
        setBurst(true);
        window.setTimeout(() => setBurst(false), 650);
      }
      return next;
    });
  }

  function handleMediaClick() {
    const now = Date.now();
    if (now - lastTap.current < 300) triggerLike(true);
    lastTap.current = now;
  }

  return (
    <section
      ref={ref}
      className={`rl-card${active ? ' rl-card--active' : ''}`}
      data-photo={isPhoto ? 'true' : 'false'}
      aria-roledescription="reel"
      aria-label={`${reel.authorName}: ${reel.caption}`}
    >
      <div className="rl-bg" style={{ backgroundImage }} aria-hidden="true" />
      <div className="rl-bg-grain" aria-hidden="true" />
      <div className="rl-scrim" aria-hidden="true" />

      {/* Double-tap-to-like surface */}
      <button
        className="rl-tap-surface"
        onClick={handleMediaClick}
        aria-label="Double-tap to like"
        tabIndex={-1}
      >
        {burst && <span className="rl-burst" aria-hidden="true">♥</span>}
      </button>

      {/* Right action rail */}
      <div className="rl-rail">
        <button
          className="rl-rail-avatar"
          onClick={() => setFollowing((f) => !f)}
          aria-label={following ? `Following ${reel.authorName}` : `Follow ${reel.authorName}`}
          title={reel.authorName}
        >
          <span className="rl-rail-avatar-glyph">{reel.avatar}</span>
          <span className={`rl-rail-follow${following ? ' rl-rail-follow--on' : ''}`} aria-hidden="true">
            {following ? '✓' : '+'}
          </span>
        </button>

        <button
          className={`rl-rail-btn${liked ? ' rl-rail-btn--liked' : ''}`}
          onClick={() => triggerLike(false)}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <span className="rl-rail-icon">{liked ? '♥' : '♡'}</span>
          <span className="rl-rail-count">{formatCount(likeCount)}</span>
        </button>

        <button
          className="rl-rail-btn"
          onClick={() => addToast('Comments coming soon 💬')}
          aria-label={`${reel.comments} comments`}
        >
          <span className="rl-rail-icon">💬</span>
          <span className="rl-rail-count">{formatCount(reel.comments)}</span>
        </button>

        <button
          className="rl-rail-btn"
          onClick={() => addToast('Link copied — share the vibes 🔗')}
          aria-label={`Share — ${reel.shares} shares`}
        >
          <span className="rl-rail-icon">↗</span>
          <span className="rl-rail-count">{formatCount(reel.shares)}</span>
        </button>

        <button
          className={`rl-rail-btn${saved ? ' rl-rail-btn--saved' : ''}`}
          onClick={() => {
            setSaved((v) => !v);
            addToast(saved ? 'Removed from saved' : 'Saved to your shelf 🔖');
          }}
          aria-pressed={saved}
          aria-label={saved ? 'Unsave' : 'Save'}
        >
          <span className="rl-rail-icon">{saved ? '🔖' : '🏷️'}</span>
          <span className="rl-rail-count">Save</span>
        </button>

        <div className="rl-rail-disc" aria-hidden="true">
          🎵
        </div>
      </div>

      {/* Bottom-left author + caption + track */}
      <div className="rl-info">
        <div className="rl-info-author">
          <span className="rl-info-name">{reel.authorName}</span>
          {reel.verified && (
            <span className="rl-verified" title="Verified" aria-label="Verified">
              ✓
            </span>
          )}
          <span className={`rl-type rl-type--${reel.authorType}`}>
            {badge.emoji} {badge.label}
          </span>
        </div>
        <div className="rl-info-handle">
          {reel.handle}
          <span className="rl-dot">·</span>
          {reelRelativeTime(reel.createdAt)}
          {reel.location && (
            <>
              <span className="rl-dot">·</span>
              <span className="rl-loc">📍 {reel.location}</span>
            </>
          )}
        </div>

        <p
          className={`rl-caption${expanded ? ' rl-caption--open' : ''}`}
          onClick={() => setExpanded((v) => !v)}
        >
          {reel.caption}
          {reel.hashtags.length > 0 && (
            <span className="rl-tags">
              {' '}
              {reel.hashtags.map((t) => (
                <span key={t} className="rl-tag">
                  #{t}
                </span>
              ))}
            </span>
          )}
        </p>

        {reel.track && (
          <div className="rl-track" title={reel.track}>
            <span className="rl-track-note" aria-hidden="true">
              🎵
            </span>
            <span className="rl-track-marquee">
              <span>{reel.track}</span>
              <span aria-hidden="true">{reel.track}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
