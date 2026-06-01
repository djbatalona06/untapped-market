import { useState } from 'react';
import { useStore } from '../store/useStore';
import { signOutUser, authModeLabel } from '../lib/auth';
import { LogInForm } from '../components/auth/LogInForm';
import { SignUpForm } from '../components/auth/SignUpForm';

export function AccountPage() {
  const user = useStore((s) => s.user);
  const addToast = useStore((s) => s.addToast);
  const navigate = useStore((s) => s.navigate);

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  if (user.signedIn) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>
            Hi, <em>@{user.username}</em>
          </h1>
          <p>
            Tier: <strong>{user.tier}</strong> · {user.email ?? 'no email on file'}
            {user.isAdmin ? ' · admin' : ''}
          </p>
        </header>
        <div className="detail-shell">
          <div className="section-card">
            <h2>Quick actions</h2>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => navigate({ page: 'library' })}>
                Open library
              </button>
              <button className="btn btn-ghost" onClick={() => navigate({ page: 'premium' })}>
                Manage plan
              </button>
              {user.isAdmin && (
                <button className="btn btn-ghost" onClick={() => navigate({ page: 'admin' })}>
                  Admin dashboard
                </button>
              )}
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await signOutUser();
                  addToast('Signed out');
                  navigate({ page: 'home' });
                }}
              >
                Sign out
              </button>
            </div>
            <p className="muted" style={{ fontSize: '0.74rem', marginTop: 12 }}>
              {authModeLabel()}
            </p>
          </div>
          <div className="section-card">
            <h2>Consumption log</h2>
            {user.consumptionLogs.length === 0 ? (
              <p className="muted">No entries yet. Log a session from any strain page.</p>
            ) : (
              user.consumptionLogs.map((l) => (
                <div
                  key={l.id}
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                  }}
                >
                  <strong>{l.strainId}</strong> · {l.method} · ★{l.rating} · {l.createdAt}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>{mode === 'sign-in' ? 'Sign in' : 'Create account'}</h1>
        <p>Save strains, get restock alerts, and sync across devices.</p>
      </header>
      <div className="detail-shell">
        <div className="auth-panel">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              role="tab"
              aria-selected={mode === 'sign-in'}
              className={`auth-tab${mode === 'sign-in' ? ' active' : ''}`}
              onClick={() => setMode('sign-in')}
            >
              Sign in
            </button>
            <button
              role="tab"
              aria-selected={mode === 'sign-up'}
              className={`auth-tab${mode === 'sign-up' ? ' active' : ''}`}
              onClick={() => setMode('sign-up')}
            >
              Sign up
            </button>
          </div>
          {mode === 'sign-in' ? (
            <LogInForm onSuccess={() => navigate({ page: 'home' })} />
          ) : (
            <SignUpForm onSuccess={() => navigate({ page: 'home' })} />
          )}
          <p className="muted" style={{ textAlign: 'center', fontSize: '0.74rem', marginTop: 16 }}>
            {authModeLabel()}
          </p>
        </div>
      </div>
    </div>
  );
}
