import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { reelBackground, type ReelAuthorType, type ReelDraft } from '../../data/reels';

interface ReelComposerProps {
  open: boolean;
  onClose: () => void;
  onPost: (draft: ReelDraft) => Promise<unknown> | void;
  isLive: boolean;
}

const AUTHOR_TYPES: Array<{ value: ReelAuthorType; label: string; emoji: string }> = [
  { value: 'person', label: 'Community', emoji: '🌍' },
  { value: 'brand', label: 'Brand', emoji: '🏷️' },
  { value: 'influencer', label: 'Creator', emoji: '⭐' },
];

const BACKDROPS: Array<{ key: string; label: string }> = [
  { key: 'tricolor-classic', label: 'Roots' },
  { key: 'goldenhour', label: 'Golden' },
  { key: 'deepforest', label: 'Forest' },
  { key: 'emberton', label: 'Ember' },
  { key: 'rootsy-soul', label: 'Soul' },
  { key: 'photo:hero-macro.jpg', label: 'Frost' },
  { key: 'photo:hero-smoke.jpg', label: 'Smoke' },
  { key: 'photo:hero-hands.jpg', label: 'Hands' },
];

/** Pull #hashtags out of free text, returning the cleaned caption + tag list. */
function splitCaption(text: string): { caption: string; hashtags: string[] } {
  const hashtags = [...text.matchAll(/#(\w+)/g)].map((m) => m[1].toLowerCase());
  const caption = text
    .replace(/#\w+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { caption, hashtags: [...new Set(hashtags)] };
}

export function ReelComposer({ open, onClose, onPost, isLive }: ReelComposerProps) {
  const user = useStore((s) => s.user);
  const addToast = useStore((s) => s.addToast);

  const [authorType, setAuthorType] = useState<ReelAuthorType>('person');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [text, setText] = useState('');
  const [track, setTrack] = useState('');
  const [bg, setBg] = useState(BACKDROPS[0].key);
  const [posting, setPosting] = useState(false);

  const preview = useMemo(() => splitCaption(text), [text]);
  // A post only reaches the shared backend when Supabase is live AND the
  // author is signed in; otherwise it's kept on this device.
  const willShare = isLive && user.signedIn;

  if (!open) return null;

  function reset() {
    setAuthorType('person');
    setName('');
    setHandle('');
    setText('');
    setTrack('');
    setBg(BACKDROPS[0].key);
  }

  async function submit() {
    const displayName =
      name.trim() || (user.signedIn ? user.username : '') || 'Anonymous';
    if (!preview.caption && preview.hashtags.length === 0) {
      addToast('Add a caption to share your vibe');
      return;
    }
    const cleanHandle = (() => {
      const h = handle.trim() || displayName.toLowerCase().replace(/[^a-z0-9]+/g, '.');
      return h.startsWith('@') ? h : `@${h}`;
    })();

    setPosting(true);
    try {
      await onPost({
        authorType,
        authorName: displayName,
        handle: cleanHandle,
        caption: preview.caption,
        hashtags: preview.hashtags,
        track: track.trim() || 'Original audio',
        bg,
      });
      addToast(willShare ? 'Posted to the feed 🌿' : 'Posted ✊ (saved on this device)');
      reset();
      onClose();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rl-composer-overlay" role="dialog" aria-modal="true" aria-label="Post a reel">
      <div className="rl-composer">
        <div className="rl-composer-head">
          <h2>Post a reel</h2>
          <button className="rl-composer-close" onClick={onClose} aria-label="Close composer">
            ✕
          </button>
        </div>

        <div className="rl-composer-body">
          <label className="rl-field-label">Posting as</label>
          <div className="rl-seg" role="group" aria-label="Account type">
            {AUTHOR_TYPES.map((t) => (
              <button
                key={t.value}
                className={`rl-seg-btn${authorType === t.value ? ' rl-seg-btn--on' : ''}`}
                onClick={() => setAuthorType(t.value)}
                aria-pressed={authorType === t.value}
              >
                <span aria-hidden="true">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="rl-field-row">
            <div className="rl-field">
              <label className="rl-field-label" htmlFor="rl-name">
                Display name
              </label>
              <input
                id="rl-name"
                className="rl-input"
                value={name}
                maxLength={40}
                placeholder={authorType === 'brand' ? 'Your brand' : 'Your name'}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="rl-field">
              <label className="rl-field-label" htmlFor="rl-handle">
                Handle
              </label>
              <input
                id="rl-handle"
                className="rl-input"
                value={handle}
                maxLength={30}
                placeholder="@yourhandle"
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
          </div>

          <label className="rl-field-label" htmlFor="rl-caption">
            Caption
          </label>
          <textarea
            id="rl-caption"
            className="rl-input rl-textarea"
            value={text}
            maxLength={280}
            rows={3}
            placeholder="Share the vibe… add #hashtags inline"
            onChange={(e) => setText(e.target.value)}
          />
          {preview.hashtags.length > 0 && (
            <div className="rl-tag-preview">
              {preview.hashtags.map((t) => (
                <span key={t} className="rl-tag">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <label className="rl-field-label" htmlFor="rl-track">
            Track
          </label>
          <input
            id="rl-track"
            className="rl-input"
            value={track}
            maxLength={60}
            placeholder="Artist — Track (or leave as original audio)"
            onChange={(e) => setTrack(e.target.value)}
          />

          <label className="rl-field-label">Backdrop</label>
          <div className="rl-backdrops">
            {BACKDROPS.map((b) => (
              <button
                key={b.key}
                className={`rl-backdrop${bg === b.key ? ' rl-backdrop--on' : ''}`}
                style={{ backgroundImage: reelBackground(b.key).backgroundImage }}
                onClick={() => setBg(b.key)}
                aria-pressed={bg === b.key}
                aria-label={`Backdrop: ${b.label}`}
                title={b.label}
              >
                <span className="rl-backdrop-label">{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rl-composer-foot">
          <span className="rl-composer-note">
            {willShare
              ? 'Shared to the live feed for everyone 🌍'
              : isLive
                ? 'Saved on this device. Sign in to share with everyone.'
                : 'Saved on this device.'}
          </span>
          <button className="btn rl-post-btn" onClick={submit} disabled={posting}>
            {posting ? 'Posting…' : 'Share reel ✊'}
          </button>
        </div>
      </div>
    </div>
  );
}
