import { useState, FormEvent, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore, STRAINS, DISPENSARIES, TRIP_REPORTS } from '@/store';
import type { TripReport } from '@/store/types';
import TerpeneBar from '@/components/TerpeneBar';
import LineageTree from '@/components/LineageTree';
import LabCertCard from '@/components/LabCertCard';

const EFFECT_OPTIONS = [
  'Euphoric',
  'Creative',
  'Relaxed',
  'Focused',
  'Sleepy',
  'Energetic',
  'Uplifted',
  'Calm',
  'Hungry',
  'Talkative',
];

const METHODS: TripReport['method'][] = [
  'flower',
  'vape',
  'edible',
  'concentrate',
  'other',
];

function typeBadgeClass(type: string) {
  return `badge badge-${type}`;
}

function stars(n: number) {
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export default function StrainDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const strain = useMemo(() => STRAINS.find((s) => s.id === id), [id]);

  const bookmarks = useStore((s) => s.bookmarks);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const likes = useStore((s) => s.likes);
  const toggleLike = useStore((s) => s.toggleLike);
  const user = useStore((s) => s.user);

  // V1 todo #9.11 — effects multi-select state.
  const [reportRating, setReportRating] = useState(0);
  const [reportMethod, setReportMethod] = useState<TripReport['method']>('flower');
  const [reportEffects, setReportEffects] = useState<string[]>([]);
  const [reportNote, setReportNote] = useState('');
  const [reports, setReports] = useState<TripReport[]>(
    TRIP_REPORTS.filter((r) => r.strainId === id)
  );

  if (!strain) {
    return (
      <div className="page detail-page">
        <Link to="/catalog" className="back-btn">
          ← Back to Strains
        </Link>
        <div className="empty-library" style={{ padding: '3rem 0' }}>
          <div className="empty-icon">🌫️</div>
          <h2>Strain not found</h2>
          <p>That strain may have been removed or the link is incorrect.</p>
          <Link to="/catalog" className="btn btn-primary mt-2">
            Browse Strains
          </Link>
        </div>
      </div>
    );
  }

  const isBookmarked = bookmarks.has(strain.id);
  const isLiked = likes.has(strain.id);
  const dispensaries = DISPENSARIES.filter((d) =>
    strain.dispensaryIds.includes(d.id)
  );
  const maxTerpPct = Math.max(...strain.terpenes.map((t) => t.pct));

  function handleToggleBookmark() {
    toggleBookmark(strain!.id);
    toast(isBookmarked ? 'Removed from library' : 'Saved to library ✓');
  }

  function handleToggleLike() {
    toggleLike(strain!.id);
    toast(isLiked ? 'Removed like' : 'Liked!');
  }

  function toggleReportEffect(effect: string) {
    setReportEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  }

  function submitReport(e: FormEvent) {
    e.preventDefault();
    if (!reportNote.trim() || reportRating === 0) {
      toast.error('Please pick a rating and add a note.');
      return;
    }
    const newReport: TripReport = {
      id: `tr-new-${Date.now()}`,
      strainId: strain!.id,
      userId: user.id,
      username: user.username,
      rating: reportRating as TripReport['rating'],
      effects:
        reportEffects.length > 0 ? reportEffects : strain!.effects.slice(0, 2),
      method: reportMethod,
      note: reportNote.trim(),
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setReports([newReport, ...reports]);
    setReportNote('');
    setReportRating(0);
    setReportEffects([]);
    toast('Trip report submitted! ✓');
  }

  async function copyLabData() {
    const text = strain!.labData.cannabinoids
      .map((c) => `${c.name}: ${c.value}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(
        `${strain!.name} — ${strain!.labData.lab} (${strain!.labData.date})\n${text}`
      );
      toast('Lab data copied to clipboard ✓');
    } catch {
      toast.error('Could not copy lab data');
    }
  }

  return (
    <div className="page">
      <div className="detail-page">
        <Link to="/catalog" className="back-btn">
          ← Back to Strains
        </Link>

        <div className="detail-hero">
          <div className="detail-hero-main">
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span className={typeBadgeClass(strain.type)}>{strain.type}</span>
              <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>
                {strain.chemotype}
              </span>
            </div>
            <h1 className="detail-name">{strain.name}</h1>
            <p className="detail-desc">{strain.description}</p>
            <div className="detail-actions">
              <button
                className={`btn ${isLiked ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleToggleLike}
                aria-label={isLiked ? 'Unlike strain' : 'Like strain'}
                aria-pressed={isLiked}
              >
                {isLiked ? '♥' : '♡'}{' '}
                {(strain.likeCount + (isLiked ? 1 : 0)).toLocaleString()}
              </button>
              <button
                className={`btn ${isBookmarked ? 'btn-amber' : 'btn-secondary'}`}
                onClick={handleToggleBookmark}
                aria-label={
                  isBookmarked ? 'Remove from library' : 'Save to library'
                }
                aria-pressed={isBookmarked}
              >
                {isBookmarked ? '♥ Saved' : '♡ Save'}
              </button>
            </div>
          </div>

          <div className="detail-hero-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-label">Potency</div>
              <div className="potency-bar-wrap">
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text2)',
                    marginBottom: '0.2rem',
                  }}
                >
                  THC ·{' '}
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--text)' }}>
                    {strain.thc}%
                  </span>
                </div>
                <div className="potency-bar-bg">
                  <div
                    className="potency-bar-fill"
                    style={{
                      width: `${(strain.thc / 35) * 100}%`,
                      background: strain.color,
                    }}
                  />
                </div>
              </div>
              <div className="potency-bar-wrap">
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--text2)',
                    marginBottom: '0.2rem',
                  }}
                >
                  CBD ·{' '}
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--text)' }}>
                    {strain.cbd}%
                  </span>
                </div>
                <div className="potency-bar-bg">
                  <div
                    className="potency-bar-fill"
                    style={{
                      width: `${(strain.cbd / 25) * 100}%`,
                      background: 'var(--teal)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">Effects</div>
              <div className="tag-cloud">
                {strain.effects.map((e) => (
                  <span key={e} className="effect-tag">
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-label">Flavors</div>
              <div className="tag-cloud">
                {strain.flavors.map((f) => (
                  <span key={f} className="terpene-pill">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Terpene Profile */}
        <div className="section-card">
          <h2>Terpene Profile</h2>
          {strain.terpenes.map((t) => (
            <TerpeneBar
              key={t.name}
              terpene={t}
              max={maxTerpPct}
              color={strain.color}
            />
          ))}
        </div>

        {/* Lineage */}
        <div className="section-card">
          <h2>Genetic Lineage</h2>
          <LineageTree strain={strain} />
        </div>

        {/* Lab Certificate */}
        <div className="section-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.5rem',
            }}
          >
            <h2 style={{ margin: 0 }}>Lab Certificate of Analysis</h2>
            <button
              className="btn btn-ghost btn-sm"
              onClick={copyLabData}
              aria-label="Copy lab data to clipboard"
            >
              📋 Copy
            </button>
          </div>
          <LabCertCard lab={strain.labData} />
        </div>

        {/* Dispensary Availability */}
        <div className="section-card">
          <h2>In Stock Near You</h2>
          {dispensaries.length === 0 && (
            <div className="text-muted">No nearby dispensaries currently stock this strain.</div>
          )}
          {dispensaries.map((d) => {
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${d.coordinates.lat},${d.coordinates.lng}`;
            return (
              <div key={d.id} className="dispensary-row">
                <div className="dispensary-row-info">
                  <div className="dispensary-row-name">{d.name}</div>
                  <div className="dispensary-row-meta">
                    {d.city}, {d.state} · {d.hours}
                  </div>
                </div>
                <div
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  <span className="rating">★ {d.rating}</span>
                  <a
                    className="btn btn-secondary btn-sm"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Get directions to ${d.name}`}
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trip Reports */}
        <div className="section-card">
          <h2>Trip Reports</h2>
          <form className="report-form" onSubmit={submitReport}>
            <div
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '1rem',
              }}
            >
              Share your experience
            </div>
            <div className="form-group">
              <span className="form-label">Rating</span>
              <div className="star-select" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    role="radio"
                    aria-checked={n === reportRating}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    className={`star-btn${n <= reportRating ? ' lit' : ''}`}
                    onClick={() => setReportRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <span className="form-label">Method</span>
              <div className="method-select">
                {METHODS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={`method-btn${reportMethod === m ? ' active' : ''}`}
                    onClick={() => setReportMethod(m)}
                    aria-pressed={reportMethod === m}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* V1 todo #9.11 — effects multi-select */}
            <div className="form-group">
              <span className="form-label">Effects felt</span>
              <div className="effect-checkboxes" role="group" aria-label="Effects felt">
                {EFFECT_OPTIONS.map((opt) => {
                  const checked = reportEffects.includes(opt);
                  return (
                    <label
                      key={opt}
                      className={`effect-check${checked ? ' checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleReportEffect(opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="report-note">
                Your notes
              </label>
              <textarea
                id="report-note"
                className="form-textarea"
                rows={3}
                placeholder="Describe your experience…"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit Report
            </button>
          </form>
          {reports.map((r) => (
            <div key={r.id} className="trip-report">
              <div className="report-header">
                <span className="report-user">@{r.username}</span>
                <span className="stars">{stars(r.rating)}</span>
                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                  {r.method}
                </span>
                <span className="report-meta">{r.createdAt}</span>
              </div>
              <div className="report-note">{r.note}</div>
              <div
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <button
                  className="vote-btn"
                  onClick={() => toast('Upvoted!')}
                  aria-label="Upvote report"
                >
                  ▲ {r.upvotes}
                </button>
                <button
                  className="vote-btn"
                  onClick={() => toast('Downvoted')}
                  aria-label="Downvote report"
                >
                  ▼ {r.downvotes}
                </button>
                <div className="terpene-pills" style={{ marginLeft: '0.25rem' }}>
                  {r.effects.map((e) => (
                    <span key={e} className="effect-tag">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
