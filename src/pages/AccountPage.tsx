import { useState } from 'react';
import { useStore } from '../store/useStore';

export function AccountPage() {
  const user = useStore((s) => s.user);
  const signIn = useStore((s) => s.signIn);
  const signUp = useStore((s) => s.signUp);
  const signOut = useStore((s) => s.signOut);
  const addToast = useStore((s) => s.addToast);
  const navigate = useStore((s) => s.navigate);

  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (user.signedIn) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>
            Hi, <em>@{user.username}</em>
          </h1>
          <p>
            Tier: <strong>{user.tier}</strong> · {user.email ?? 'no email on file'}
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
              <button
                className="btn btn-ghost"
                onClick={() => {
                  signOut();
                  addToast('Signed out');
                  navigate({ page: 'home' });
                }}
              >
                Sign out
              </button>
            </div>
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
        <h1>
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </h1>
        <p>Simulated OAuth — local-only for the v2.0 demo.</p>
      </header>
      <div className="detail-shell">
        <div className="auth-panel">
          <div className="row" style={{ marginBottom: 16, justifyContent: 'center' }}>
            <button
              className={`nav-link${mode === 'sign-in' ? ' active' : ''}`}
              onClick={() => setMode('sign-in')}
            >
              Sign in
            </button>
            <button
              className={`nav-link${mode === 'sign-up' ? ' active' : ''}`}
              onClick={() => setMode('sign-up')}
            >
              Sign up
            </button>
          </div>
          {mode === 'sign-up' && (
            <input
              className="auth-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input
            className="auth-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="auth-input"
            placeholder="Password (not stored)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="btn"
            style={{ width: '100%' }}
            onClick={() => {
              if (!username.trim()) {
                addToast('Enter a username');
                return;
              }
              if (mode === 'sign-in') {
                signIn(username.trim(), email || undefined);
                addToast(`Welcome back, @${username}`);
              } else {
                if (!email.trim()) {
                  addToast('Enter an email');
                  return;
                }
                signUp(username.trim(), email.trim());
                addToast(`Account created — @${username}`);
              }
              navigate({ page: 'home' });
            }}
          >
            {mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
          <div
            className="muted"
            style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              marginTop: 16,
              borderTop: '1px solid var(--border)',
              paddingTop: 12,
            }}
          >
            Or continue with:
          </div>
          <div className="row" style={{ marginTop: 10, justifyContent: 'center' }}>
            {['Google', 'Apple', 'GitHub'].map((p) => (
              <button
                key={p}
                className="btn btn-ghost"
                onClick={() => {
                  signIn(`${p.toLowerCase()}_user`);
                  addToast(`Signed in via ${p} (simulated)`);
                  navigate({ page: 'home' });
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
