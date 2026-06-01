import type { ReactNode } from 'react';
import { useStore } from '../../store/useStore';

/**
 * Client-side gate for the /admin surface. This is a UX guard only — the real
 * enforcement lives in Supabase RLS (public.is_admin()), so a non-admin who
 * bypasses this still can't read the queue or mutate media.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  const authReady = useStore((s) => s.authReady);
  const user = useStore((s) => s.user);
  const navigate = useStore((s) => s.navigate);
  const setAuthModalOpen = useStore((s) => s.setAuthModalOpen);

  if (!authReady) {
    return (
      <div className="page">
        <div className="detail-shell">
          <div className="section-card">
            <p className="muted">Checking access…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user.signedIn) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Admin</h1>
          <p>Sign in with an admin account to continue.</p>
        </header>
        <div className="detail-shell">
          <div className="section-card" style={{ textAlign: 'center' }}>
            <button className="btn" onClick={() => setAuthModalOpen(true)}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user.isAdmin) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Access denied</h1>
          <p>
            @{user.username} doesn’t have admin privileges. Ask an existing admin to grant access.
          </p>
        </header>
        <div className="detail-shell">
          <div className="section-card" style={{ textAlign: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate({ page: 'home' })}>
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
