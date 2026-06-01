import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, ADMIN_EMAIL_ALLOWLIST } from './supabase';
import { useStore } from '../store/useStore';
import type { UserProfile } from '../types';

export type OAuthProvider = 'google' | 'apple' | 'github';

export interface AuthResult {
  error?: string;
  /** True when sign-up succeeded but the user must confirm via email first. */
  needsConfirmation?: boolean;
}

/** Map a Supabase session to the app's UserProfile, enriching with the profiles row. */
async function sessionToUser(session: Session): Promise<UserProfile> {
  const authUser = session.user;
  const email = authUser.email ?? undefined;
  let username =
    (authUser.user_metadata?.username as string | undefined) ||
    email?.split('@')[0] ||
    'member';
  let tier: UserProfile['tier'] = 'free';
  let isAdmin = email ? ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase()) : false;

  if (supabase) {
    const { data } = await supabase
      .from('profiles')
      .select('username, tier, is_admin')
      .eq('id', authUser.id)
      .maybeSingle();
    if (data) {
      username = data.username ?? username;
      tier = (data.tier as UserProfile['tier']) ?? tier;
      isAdmin = Boolean(data.is_admin) || isAdmin;
    }
  }

  return { id: authUser.id, username, email, tier, signedIn: true, isAdmin, preferences: {}, consumptionLogs: [] };
}

/**
 * Wire Supabase auth into the store. Mount once at the App root.
 * In mock mode (no env) it simply flags auth as ready so the UI doesn't block.
 */
export function useAuthState() {
  const setSessionUser = useStore((s) => s.setSessionUser);
  const setAuthReady = useStore((s) => s.setAuthReady);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthReady(true);
      return;
    }
    let active = true;
    const client = supabase;

    client.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSessionUser(data.session ? await sessionToUser(data.session) : null);
      setAuthReady(true);
    });

    const { data: sub } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setSessionUser(session ? await sessionToUser(session) : null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [setSessionUser, setAuthReady]);
}

export async function signUpWithEmail(args: {
  email: string;
  password: string;
  username: string;
}): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    useStore.getState().signUp(args.username, args.email);
    return {};
  }
  const { data, error } = await supabase.auth.signUp({
    email: args.email,
    password: args.password,
    options: { data: { username: args.username }, emailRedirectTo: window.location.origin },
  });
  if (error) return { error: error.message };
  return { needsConfirmation: !data.session };
}

export async function signInWithEmail(args: { email: string; password: string }): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    useStore.getState().signIn(args.email.split('@')[0] || 'member', args.email);
    return {};
  }
  const { error } = await supabase.auth.signInWithPassword(args);
  return error ? { error: error.message } : {};
}

export async function signInWithOAuth(provider: OAuthProvider): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    useStore.getState().signIn(`${provider}_user`);
    return {};
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
  // On success the browser is redirected to the provider, so this rarely returns.
  return error ? { error: error.message } : {};
}

export async function signOutUser(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    useStore.getState().signOut();
    return;
  }
  await supabase.auth.signOut();
  useStore.getState().setSessionUser(null);
}

/** Human-readable note for the auth UI footer. */
export function authModeLabel(): string {
  return isSupabaseConfigured
    ? 'Secured by Supabase Auth'
    : 'Demo mode — sign-in is simulated locally and not stored';
}
