import { useState } from 'react';
import { signInWithEmail, signInWithOAuth, type OAuthProvider } from '../../lib/auth';
import { useStore } from '../../store/useStore';

const OAUTH: Array<{ id: OAuthProvider; label: string }> = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'github', label: 'GitHub' },
];

export function LogInForm({ onSuccess }: { onSuccess?: () => void }) {
  const addToast = useStore((s) => s.addToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast('Enter your email and password');
      return;
    }
    setBusy(true);
    const { error } = await signInWithEmail({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      addToast(error);
      return;
    }
    addToast('Welcome back ✓');
    onSuccess?.();
  }

  async function oauth(provider: OAuthProvider) {
    setBusy(true);
    const { error } = await signInWithOAuth(provider);
    setBusy(false);
    if (error) addToast(error);
    else onSuccess?.();
  }

  return (
    <form onSubmit={submit} aria-label="Log in">
      <label className="auth-label" htmlFor="login-email">
        Email
      </label>
      <input
        id="login-email"
        className="auth-input"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="auth-label" htmlFor="login-password">
        Password
      </label>
      <input
        id="login-password"
        className="auth-input"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="auth-divider"><span>or continue with</span></div>
      <div className="row" style={{ justifyContent: 'center' }}>
        {OAUTH.map((p) => (
          <button
            key={p.id}
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => oauth(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
    </form>
  );
}
