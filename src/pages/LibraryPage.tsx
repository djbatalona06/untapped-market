import { useState } from 'react';
import { useStore } from '../store/useStore';
import { STRAINS } from '../data/strains';
import { StrainCard } from '../components/StrainCard';

export function LibraryPage() {
  const bookmarks = useStore((s) => s.bookmarks);
  const folders = useStore((s) => s.folders);
  const createFolder = useStore((s) => s.createFolder);
  const renameFolder = useStore((s) => s.renameFolder);
  const deleteFolder = useStore((s) => s.deleteFolder);
  const addToFolder = useStore((s) => s.addToFolder);
  const removeFromFolder = useStore((s) => s.removeFromFolder);
  const alerts = useStore((s) => s.alerts);
  const toggleAlert = useStore((s) => s.toggleAlert);
  const addToast = useStore((s) => s.addToast);
  const user = useStore((s) => s.user);
  const navigate = useStore((s) => s.navigate);

  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderEmoji, setNewFolderEmoji] = useState('🌿');

  const bookmarked = STRAINS.filter((s) => bookmarks.has(s.id));
  const isPremium = user.tier !== 'free';

  return (
    <div className="page">
      <header className="page-header">
        <h1>
          Your <em>library</em>
        </h1>
        <p>Bookmarks, folders, and active inventory alerts in one place.</p>
      </header>
      <div className="detail-shell">
        <div className="section-card">
          <h2>Bookmarked strains ({bookmarked.length})</h2>
          {bookmarked.length === 0 ? (
            <p className="muted">No bookmarks yet — tap the ☆ on any strain.</p>
          ) : (
            <div className="strain-grid" style={{ marginTop: 12 }}>
              {bookmarked.map((s) => (
                <StrainCard key={s.id} strain={s} />
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 style={{ margin: 0 }}>Smart folders</h2>
            {!isPremium && (
              <span className="badge badge-sativa">Premium feature</span>
            )}
          </div>
          {!isPremium ? (
            <>
              <p className="muted">
                Folders, COA PDF export, and unlimited alerts unlock with Premium.
              </p>
              <button
                className="btn btn-amber"
                style={{ marginTop: 12 }}
                onClick={() => navigate({ page: 'premium' })}
              >
                Upgrade to Premium
              </button>
            </>
          ) : (
            <>
              <div className="row" style={{ marginBottom: 16 }}>
                <input
                  className="auth-input"
                  style={{ marginBottom: 0, flex: 1 }}
                  placeholder="Folder name (e.g. 'Bedtime')"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <input
                  className="auth-input"
                  style={{ marginBottom: 0, width: 70 }}
                  value={newFolderEmoji}
                  onChange={(e) => setNewFolderEmoji(e.target.value)}
                />
                <button
                  className="btn"
                  onClick={() => {
                    if (!newFolderName.trim()) return;
                    createFolder(newFolderName.trim(), newFolderEmoji);
                    setNewFolderName('');
                    addToast('Folder created');
                  }}
                >
                  + New folder
                </button>
              </div>
              {folders.map((f) => (
                <div
                  key={f.id}
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
                    style={{ justifyContent: 'space-between', marginBottom: 8 }}
                  >
                    <strong>
                      {f.emoji} {f.name}{' '}
                      <span className="muted" style={{ fontWeight: 400 }}>
                        ({f.strainIds.length})
                      </span>
                    </strong>
                    <div className="row">
                      <button
                        className="nav-link"
                        onClick={() => {
                          const next = prompt('Rename folder', f.name);
                          if (next && next.trim()) renameFolder(f.id, next.trim());
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className="nav-link"
                        style={{ color: 'var(--red)' }}
                        onClick={() => {
                          if (confirm(`Delete folder "${f.name}"?`)) deleteFolder(f.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="filter-chip-row">
                    {bookmarked.map((s) => {
                      const inFolder = f.strainIds.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          className={`filter-chip${inFolder ? ' active' : ''}`}
                          onClick={() =>
                            inFolder
                              ? removeFromFolder(f.id, s.id)
                              : addToFolder(f.id, s.id)
                          }
                        >
                          {inFolder ? '✓ ' : '+ '}
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="section-card">
          <h2>Active inventory alerts ({alerts.length})</h2>
          {alerts.length === 0 ? (
            <p className="muted">Toggle the alert switch on a strain page to enable restock / price-drop notifications.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {alerts.map((a) => {
                const s = STRAINS.find((x) => x.id === a.strainId);
                if (!s) return null;
                return (
                  <div
                    key={a.id}
                    className="row"
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <strong>{s.name}</strong>
                      <span className="muted" style={{ marginLeft: 8 }}>· {a.type}</span>
                    </div>
                    <button
                      className="nav-link"
                      style={{ color: 'var(--red)' }}
                      onClick={() => {
                        toggleAlert(a.strainId, a.type, a.dispensaryId);
                        addToast('Alert removed');
                      }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
