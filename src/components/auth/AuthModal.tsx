import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { authModeLabel } from '../../lib/auth';
import { LogInForm } from './LogInForm';
import { SignUpForm } from './SignUpForm';

/**
 * App-wide auth modal. Opened on demand via `setAuthModalOpen(true)` — e.g. the
 * nav avatar for guests or the admin gate. Not force-shown on load, so the
 * public catalog stays browsable without an account.
 */
export function AuthModal() {
  const open = useStore((s) => s.authModalOpen);
  const setOpen = useStore((s) => s.setAuthModalOpen);
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div
        className="modal-card auth-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" aria-label="Close" onClick={() => setOpen(false)}>
          ✕
        </button>
        <h2 id="auth-modal-title" style={{ textAlign: 'center', marginBottom: 4 }}>
          {mode === 'sign-in' ? 'Welcome back' : 'Join Untapped Market'}
        </h2>

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
          <LogInForm onSuccess={() => setOpen(false)} />
        ) : (
          <SignUpForm onSuccess={() => setOpen(false)} />
        )}

        <p className="muted" style={{ textAlign: 'center', fontSize: '0.74rem', marginTop: 16 }}>
          {authModeLabel()}
        </p>
      </div>
    </div>
  );
}
