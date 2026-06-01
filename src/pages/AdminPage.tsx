import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  uploadStrainMedia,
  fetchStrainMediaByStatus,
  reviewStrainMedia,
  setPrimaryStrainMedia,
  deleteStrainMedia,
  loadApprovedStrainMedia,
} from '../lib/media';
import type { StrainMedia } from '../types';

function strainName(id: string): string {
  return STRAINS.find((s) => s.id === id)?.name ?? id;
}

export function AdminPage() {
  const user = useStore((s) => s.user);
  const addToast = useStore((s) => s.addToast);
  const setStrainMedia = useStore((s) => s.setStrainMedia);

  const [strainId, setStrainId] = useState(STRAINS[0]?.id ?? '');
  const [altText, setAltText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState<StrainMedia[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function refreshQueue() {
    setLoadingQueue(true);
    setQueue(await fetchStrainMediaByStatus('pending'));
    setLoadingQueue(false);
  }

  useEffect(() => {
    if (isSupabaseConfigured) void refreshQueue();
  }, []);

  async function syncApproved() {
    setStrainMedia(await loadApprovedStrainMedia());
  }

  async function submitUpload() {
    if (!file) return addToast('Choose an image first');
    if (!strainId) return addToast('Pick a strain');
    setBusy(true);
    const { error } = await uploadStrainMedia(file, { strainId, altText: altText.trim() || undefined });
    setBusy(false);
    if (error) return addToast(error);
    addToast('Uploaded — pending review ✓');
    setFile(null);
    setAltText('');
    if (inputRef.current) inputRef.current.value = '';
    void refreshQueue();
  }

  async function approve(m: StrainMedia) {
    const { error } = await reviewStrainMedia(m.id, 'approved');
    if (error) return addToast(error);
    addToast('Approved ✓');
    await refreshQueue();
    await syncApproved();
  }

  async function reject(m: StrainMedia) {
    const { error } = await reviewStrainMedia(m.id, 'rejected');
    if (error) return addToast(error);
    addToast('Rejected');
    await refreshQueue();
  }

  async function feature(m: StrainMedia) {
    const { error } = await setPrimaryStrainMedia(m.id, m.strainId);
    if (error) return addToast(error);
    addToast('Set as primary ✓');
    await syncApproved();
  }

  async function remove(m: StrainMedia) {
    const { error } = await deleteStrainMedia(m.id, m.storagePath);
    if (error) return addToast(error);
    addToast('Deleted');
    await refreshQueue();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) setFile(f);
    else addToast('Drop an image file');
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>
          Admin · <em>Media</em>
        </h1>
        <p>
          Signed in as <strong>@{user.username}</strong> · curate strain photography and the
          approval queue.
        </p>
      </header>

      <div className="detail-shell">
        {!isSupabaseConfigured && (
          <div className="section-card" style={{ borderColor: 'var(--ember-dim)' }}>
            <h2>⚠ Supabase not configured</h2>
            <p className="muted">
              Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, run{' '}
              <code>schema.sql</code>, and promote your account to admin to enable uploads and the
              moderation queue. The interface below is inert until then.
            </p>
          </div>
        )}

        <div className="section-card">
          <h2>Upload strain photo</h2>
          <label className="auth-label" htmlFor="admin-strain">
            Strain
          </label>
          <select
            id="admin-strain"
            className="auth-input"
            value={strainId}
            onChange={(e) => setStrainId(e.target.value)}
          >
            {STRAINS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="auth-label" htmlFor="admin-alt">
            Alt text (for accessibility)
          </label>
          <input
            id="admin-alt"
            className="auth-input"
            placeholder="Macro of frosted amber trichomes on a Cascadia Haze bud"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />

          <div
            className={`dropzone${dragOver ? ' dragover' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload image — drag a file here or click to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
            }}
          >
            {file ? (
              <span>{file.name}</span>
            ) : (
              <span className="muted">Drag an image here, or click to browse</span>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <button className="btn" style={{ marginTop: 12 }} onClick={submitUpload} disabled={busy}>
            {busy ? 'Uploading…' : 'Submit for review'}
          </button>
        </div>

        <div className="section-card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>Moderation queue</h2>
            <button className="btn btn-ghost" onClick={refreshQueue} disabled={loadingQueue}>
              {loadingQueue ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          {queue.length === 0 ? (
            <p className="muted" style={{ marginTop: 12 }}>
              Nothing pending. Newly uploaded photos appear here for approval.
            </p>
          ) : (
            <div className="admin-queue">
              {queue.map((m) => (
                <div key={m.id} className="admin-queue-item">
                  {m.url ? (
                    <img src={m.url} alt={m.altText ?? strainName(m.strainId)} loading="lazy" />
                  ) : (
                    <div className="admin-queue-thumb-fallback" aria-hidden="true">
                      🖼
                    </div>
                  )}
                  <div className="admin-queue-meta">
                    <strong>{strainName(m.strainId)}</strong>
                    <span className="muted">
                      {m.source}
                      {m.aiModel ? ` · ${m.aiModel}` : ''} · {m.createdAt.slice(0, 10)}
                    </span>
                    <div className="row" style={{ marginTop: 6 }}>
                      <button className="btn" onClick={() => approve(m)}>
                        Approve
                      </button>
                      <button className="btn btn-ghost" onClick={() => feature(m)}>
                        Make primary
                      </button>
                      <button className="btn btn-ghost" onClick={() => reject(m)}>
                        Reject
                      </button>
                      <button className="btn btn-ghost" onClick={() => remove(m)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
