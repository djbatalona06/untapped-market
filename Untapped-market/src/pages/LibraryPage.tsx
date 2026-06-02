import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore, STRAINS } from '@/store';
import StrainCard from '@/components/StrainCard';
import EmptyState from '@/components/EmptyState';

interface SmartFolder {
  id: string;
  name: string;
  strainIds: string[];
}

export default function LibraryPage() {
  const bookmarks = useStore((s) => s.bookmarks);
  const user = useStore((s) => s.user);
  const saved = STRAINS.filter((s) => bookmarks.has(s.id));
  const isPremium = user.tier === 'premium';

  // V1 todo #9.10 — Smart Folders dialog stub (premium-only).
  const [folders, setFolders] = useState<SmartFolder[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  function createFolder(e: FormEvent) {
    e.preventDefault();
    const name = folderName.trim();
    if (!name) return;
    setFolders((prev) => [
      ...prev,
      { id: `folder-${Date.now()}`, name, strainIds: [] },
    ]);
    setFolderName('');
    setDialogOpen(false);
    toast(`Folder "${name}" created ✓`);
  }

  return (
    <div className="page">
      <div className="library-page">
        <div className="library-header">
          <h1>Your Library</h1>
          <p style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>
            {saved.length} saved strain{saved.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!isPremium && (
          <div className="premium-nudge">
            <span className="nudge-icon">✦</span>
            <div className="nudge-text">
              <h3>Unlock Smart Folders with Premium</h3>
              <p>
                Organize strains by mood, time of day, or custom labels. $7/month.
              </p>
            </div>
            <Link to="/premium" className="btn btn-amber btn-sm">
              Upgrade
            </Link>
          </div>
        )}

        {isPremium && (
          <div className="section-card" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h2 style={{ margin: 0 }}>Smart Folders</h2>
              <button
                className="btn btn-amber btn-sm"
                onClick={() => setDialogOpen(true)}
                aria-label="Create new smart folder"
              >
                + Create Folder
              </button>
            </div>
            {folders.length === 0 ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                No folders yet. Create one to start organizing your library.
              </p>
            ) : (
              <div className="folder-grid">
                {folders.map((f) => (
                  <div key={f.id} className="folder-chip">
                    <span className="folder-name">{f.name}</span>
                    <span className="folder-count">
                      {f.strainIds.length} strain
                      {f.strainIds.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {dialogOpen && (
          <div
            className="dialog-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Create folder"
          >
            <div
              className="dialog-backdrop"
              onClick={() => setDialogOpen(false)}
            />
            <form className="dialog-panel" onSubmit={createFolder}>
              <h3 style={{ marginTop: 0 }}>Create Smart Folder</h3>
              <label className="form-label" htmlFor="folder-name">
                Folder name
              </label>
              <input
                id="folder-name"
                className="filter-input"
                placeholder="e.g. Wind-down, Morning, Creative…"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-amber btn-sm">
                  Create
                </button>
              </div>
            </form>
          </div>
        )}

        {saved.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Your library is empty"
            description="Save strains from the catalog to build your collection."
            action={
              <Link to="/catalog" className="btn btn-primary mt-2">
                Browse Strains
              </Link>
            }
          />
        ) : (
          <div className="strain-grid">
            {saved.map((s) => (
              <StrainCard key={s.id} strain={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
