import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { DISPENSARIES } from '../data/dispensaries';
import type { FormFactor, Strain } from '../types';

const EFFECT_PALETTE = [
  'Euphoric',
  'Creative',
  'Focused',
  'Energetic',
  'Relaxed',
  'Sleepy',
  'Happy',
  'Hungry',
  'Calm',
  'Pain relief',
  'Clear-headed',
  'Talkative',
  'Giggly',
];

function typeBadgeClass(strain: Strain) {
  if (strain.chemotype.startsWith('Type III')) return 'badge badge-cbd';
  if (strain.type === 'indica') return 'badge badge-indica';
  if (strain.type === 'sativa') return 'badge badge-sativa';
  return 'badge badge-hybrid';
}

export function StrainDetailPage({ strainId }: { strainId: string }) {
  const navigate = useStore((s) => s.navigate);
  const isAlerted = useStore((s) => s.isAlerted);
  const toggleAlert = useStore((s) => s.toggleAlert);
  const addToast = useStore((s) => s.addToast);
  const bookmarks = useStore((s) => s.bookmarks);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const postTripReport = useStore((s) => s.postTripReport);
  const upvoteReport = useStore((s) => s.upvoteReport);
  const reports = useStore((s) => s.tripReports);
  const user = useStore((s) => s.user);

  const strain = useMemo(() => STRAINS.find((s) => s.id === strainId), [strainId]);
  const stockingDisps = useMemo(
    () => DISPENSARIES.filter((d) => strain && d.strainIds.includes(strain.id)).slice(0, 8),
    [strain]
  );
  const strainReports = useMemo(
    () => reports.filter((r) => r.strainId === strainId),
    [reports, strainId]
  );

  const [reportRating, setReportRating] = useState(5);
  const [reportMethod, setReportMethod] = useState<FormFactor>('flower');
  const [reportEffects, setReportEffects] = useState<Set<string>>(new Set());
  const [reportNote, setReportNote] = useState('');

  if (!strain) {
    return (
      <div className="page">
        <div className="detail-shell">
          <p>Strain not found.</p>
          <button className="btn" onClick={() => navigate({ page: 'catalog' })}>
            Back to catalog
          </button>
        </div>
      </div>
    );
  }

  const alerted = isAlerted(strain.id);
  const bookmarked = bookmarks.has(strain.id);

  function copyLabCert() {
    if (!strain) return;
    const lines = strain.labData.cannabinoids
      .map((c) => `${c.name.padEnd(6)} ${c.value}`)
      .join('\n');
    const text = `${strain.name} — Certificate of Analysis\nLab: ${strain.labData.lab}\nDate: ${strain.labData.date}\n\n${lines}`;
    navigator.clipboard?.writeText(text).then(
      () => addToast('Lab cert copied to clipboard'),
      () => addToast('Copy failed — clipboard unavailable')
    );
  }

  function submitReport() {
    if (!reportNote.trim()) {
      addToast('Add a note before posting');
      return;
    }
    postTripReport({
      strainId: strain!.id,
      userId: user.id,
      username: user.signedIn ? user.username : 'guest',
      rating: reportRating,
      effects: Array.from(reportEffects),
      method: reportMethod,
      note: reportNote.trim(),
    });
    setReportNote('');
    setReportEffects(new Set());
    addToast('Trip report posted');
  }

  const maxTerp = Math.max(...strain.terpenes.map((t) => t.pct));

  return (
    <div className="page">
      <div className="detail-shell">
        <button className="back-btn" onClick={() => navigate({ page: 'catalog' })}>
          ← Strains
        </button>
        <div className="detail-head">
          <div className="row">
            <span className={typeBadgeClass(strain)}>{strain.type}</span>
            <span className="muted mono" style={{ fontSize: '0.78rem' }}>{strain.chemotype}</span>
            <button
              className={`bookmark-btn${bookmarked ? ' active' : ''}`}
              onClick={() => {
                const added = toggleBookmark(strain.id);
                addToast(added ? 'Bookmarked' : 'Removed bookmark');
              }}
              style={{ fontSize: '1.4rem', marginLeft: 'auto' }}
            >
              {bookmarked ? '★' : '☆'}
            </button>
          </div>
          <h1>{strain.name}</h1>
          <div className="detail-meta-row">
            <span className="mono">THC {strain.thc}%</span>
            <span className="muted">·</span>
            <span className="mono">CBD {strain.cbd}%</span>
            <span className="muted">·</span>
            <span>❤ {strain.likeCount.toLocaleString()}</span>
            <span className="muted">·</span>
            <span>{strain.dispensaryIds.length} dispensaries stock this</span>
          </div>
        </div>

        <div className="section-card">
          <h2>About this strain</h2>
          <p style={{ color: 'var(--text2)' }}>{strain.description}</p>
        </div>

        <div className="section-card">
          <div
            className="row"
            style={{ justifyContent: 'space-between', marginBottom: 12 }}
          >
            <h2 style={{ margin: 0 }}>Live inventory alert</h2>
            <button
              className={`toggle${alerted ? ' on' : ''}`}
              onClick={() => {
                const added = toggleAlert(strain.id);
                addToast(added ? 'Restock & price-drop alerts on' : 'Alerts off');
              }}
              aria-label="Toggle alerts"
            />
          </div>
          <p className="muted" style={{ fontSize: '0.9rem' }}>
            When this strain restocks at one of the {strain.dispensaryIds.length} shops carrying it
            — or when the price drops — you'll get a notification in your center.
          </p>
        </div>

        <div className="section-card">
          <h2>Terpene profile</h2>
          {strain.terpenes.map((t) => (
            <div key={t.name} className="terp-row">
              <span className="terp-name">{t.name}</span>
              <div className="terp-bar">
                <div
                  className="terp-bar-fill"
                  style={{ width: `${(t.pct / maxTerp) * 100}%` }}
                />
              </div>
              <span className="terp-pct">{t.pct}%</span>
              <span className="terp-effect">{t.effect}</span>
            </div>
          ))}
        </div>

        <div className="section-card">
          <div
            className="row"
            style={{ justifyContent: 'space-between', marginBottom: 12 }}
          >
            <h2 style={{ margin: 0 }}>Lab certificate</h2>
            <button className="btn btn-ghost" onClick={copyLabCert}>
              📋 Copy
            </button>
          </div>
          <p className="muted" style={{ fontSize: '0.82rem', marginBottom: 12 }}>
            {strain.labData.lab} · {strain.labData.date}
          </p>
          <div className="cannabinoid-grid">
            {strain.labData.cannabinoids.map((c) => (
              <div key={c.name} className="cannabinoid-cell">
                <div className="cannabinoid-name">{c.name}</div>
                <div className="cannabinoid-value">{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h2>Lineage</h2>
          <p className="muted" style={{ fontSize: '0.95rem' }}>
            {strain.lineage.mother} {strain.lineage.father && `× ${strain.lineage.father}`}
          </p>
        </div>

        <div className="section-card">
          <h2>Stocking in Seattle</h2>
          {stockingDisps.length === 0 ? (
            <p className="muted">Not currently stocked — toggle alerts above to be notified.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {stockingDisps.map((d) => (
                <div
                  key={d.id}
                  className="disp-card"
                  onClick={() => navigate({ page: 'finder', dispensaryId: d.id })}
                >
                  <div className="disp-card-name">{d.name}</div>
                  <div className="disp-card-meta">
                    {d.address}, {d.city} · ★ {d.rating}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Trip reports ({strainReports.length})</h2>
          {strainReports.map((r) => (
            <div
              key={r.id}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div
                className="row"
                style={{ justifyContent: 'space-between', marginBottom: 6 }}
              >
                <strong>@{r.username}</strong>
                <span className="muted" style={{ fontSize: '0.78rem' }}>
                  {'★'.repeat(r.rating)} · {r.method} · {r.createdAt}
                </span>
              </div>
              <div className="row" style={{ marginBottom: 6 }}>
                {r.effects.map((e) => (
                  <span key={e} className="tag-chip">
                    {e}
                  </span>
                ))}
              </div>
              <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>{r.note}</p>
              <button
                className="nav-link"
                style={{ marginTop: 6 }}
                onClick={() => upvoteReport(r.id)}
              >
                ⬆ {r.upvotes}
              </button>
            </div>
          ))}

          <h3 style={{ fontFamily: 'DM Serif Display, serif', marginTop: 18, marginBottom: 10 }}>
            Post your own
          </h3>
          <div className="row" style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                className={`filter-chip${reportRating === n ? ' active' : ''}`}
                onClick={() => setReportRating(n)}
              >
                {'★'.repeat(n)}
              </button>
            ))}
          </div>
          <div className="filter-chip-row" style={{ marginBottom: 8 }}>
            {(['flower', 'vape', 'edibles', 'concentrates', 'tincture'] as FormFactor[]).map(
              (m) => (
                <button
                  key={m}
                  className={`filter-chip${reportMethod === m ? ' active' : ''}`}
                  onClick={() => setReportMethod(m)}
                >
                  {m}
                </button>
              )
            )}
          </div>
          <div className="filter-chip-row" style={{ marginBottom: 8 }}>
            {EFFECT_PALETTE.map((e) => (
              <button
                key={e}
                className={`filter-chip${reportEffects.has(e) ? ' active' : ''}`}
                onClick={() => {
                  const next = new Set(reportEffects);
                  if (next.has(e)) next.delete(e);
                  else next.add(e);
                  setReportEffects(next);
                }}
              >
                {e}
              </button>
            ))}
          </div>
          <textarea
            className="auth-input"
            placeholder="How did it feel? What did you notice?"
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <button className="btn" onClick={submitReport}>
            Post trip report
          </button>
        </div>
      </div>
    </div>
  );
}
