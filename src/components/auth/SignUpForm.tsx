import { useState } from 'react';
import { signUpWithEmail, signInWithOAuth, type OAuthProvider } from '../../lib/auth';
import { useStore } from '../../store/useStore';

const OAUTH: Array<{ id: OAuthProvider; label: string }> = [
  { id: 'google', label: 'Google' },
  { id: 'apple', label: 'Apple' },
  { id: 'github', label: 'GitHub' },
];

export function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const addToast = useStore((s) => s.addToast);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !username.trim() || !password) {
      addToast('Fill in email, username, and password');
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    const { error, needsConfirmation } = await signUpWithEmail({
      email: email.trim(),
      username: username.trim(),
      password,
    });
    setBusy(false);
    if (error) {
      addToast(error);
      return;
    }
    if (needsConfirmation) {
      addToast('Check your email to confirm your account ✉️');
      onSuccess?.();
      return;
    }
    addToast(`Account created — welcome, @${username.trim()}`);
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
    <form onSubmit={submit} aria-label="Create account">
      <label className="auth-label" htmlFor="signup-email">
        Email
      </label>
      <input
        id="signup-email"
        className="auth-input"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="auth-label" htmlFor="signup-username">
        Username
      </label>
      <input
        id="signup-username"
        className="auth-input"
        autoComplete="username"
        placeholder="pnw_explorer"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <label className="auth-label" htmlFor="signup-password">
        Password
      </label>
      <input
        id="signup-password"
        className="auth-input"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn" style={{ width: '100%', marginTop: 4 }} type="submit" disabled={busy}>
        {busy ? 'Creating account…' : 'Create account'}
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
