import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { REEL_SEEDS } from '../data/reels';
import type { Reel, ReelAuthorType, ReelDraft } from '../data/reels';

// ── Reels repository ────────────────────────────────────────────────────────
// Posting works in every mode:
//   • Always optimistic + persisted to localStorage (survives refresh, offline).
//   • When Supabase is configured AND the user is signed in, the reel is also
//     written to public.reels so it shows up for everyone. Reads merge the
//     remote table on top of the seeds + local drafts.
// Mirrors the app's "real backend when available, graceful mock otherwise"
// pattern used by auth + strain media.

const LOCAL_KEY = 'um.reels.local.v1';

interface ReelRow {
  id: string;
  author_type: ReelAuthorType;
  author_name: string;
  handle: string;
  avatar: string | null;
  verified: boolean | null;
  caption: string;
  hashtags: string[] | null;
  track: string | null;
  bg: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  location: string | null;
  created_at: string;
}

function rowToReel(r: ReelRow): Reel {
  return {
    id: r.id,
    authorType: r.author_type,
    authorName: r.author_name,
    handle: r.handle,
    avatar: r.avatar || defaultAvatar(r.author_type, r.author_name),
    verified: Boolean(r.verified),
    caption: r.caption,
    hashtags: r.hashtags ?? [],
    track: r.track ?? '',
    bg: r.bg || r.id,
    likes: r.likes ?? 0,
    comments: r.comments ?? 0,
    shares: r.shares ?? 0,
    location: r.location ?? undefined,
    createdAt: r.created_at,
  };
}

export function defaultAvatar(type: ReelAuthorType, name: string): string {
  if (type === 'brand') return '🏷️';
  if (type === 'influencer') return '⭐';
  return (name.trim()[0] || '🌍').toUpperCase();
}

function loadLocalReels(): Reel[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Reel[]) : [];
  } catch {
    return [];
  }
}

function saveLocalReels(list: Reel[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 50)));
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

/** Dedupe by id, newest first. */
function mergeReels(...lists: Reel[][]): Reel[] {
  const byId = new Map<string, Reel>();
  for (const list of lists) for (const r of list) if (!byId.has(r.id)) byId.set(r.id, r);
  return [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function fetchRemoteReels(): Promise<Reel[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('reels')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as ReelRow[]).map(rowToReel);
}

async function createReel(draft: ReelDraft): Promise<Reel> {
  const reel: Reel = {
    id: 'rl-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    authorType: draft.authorType,
    authorName: draft.authorName.trim() || 'Anonymous',
    handle: draft.handle.trim() || '@anon',
    avatar: defaultAvatar(draft.authorType, draft.authorName),
    verified: false,
    caption: draft.caption.trim(),
    hashtags: draft.hashtags,
    track: draft.track.trim(),
    bg: draft.bg,
    likes: 0,
    comments: 0,
    shares: 0,
    createdAt: new Date().toISOString(),
  };

  // Always persist locally so the post survives a refresh even with no backend.
  saveLocalReels([reel, ...loadLocalReels()]);

  if (isSupabaseConfigured && supabase) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId) {
      const { data } = await supabase
        .from('reels')
        .insert({
          author_type: reel.authorType,
          author_name: reel.authorName,
          handle: reel.handle,
          avatar: reel.avatar,
          caption: reel.caption,
          hashtags: reel.hashtags,
          track: reel.track,
          bg: reel.bg,
          location: reel.location ?? null,
          created_by: userId,
        })
        .select()
        .single();
      if (data) return rowToReel(data as ReelRow);
    }
  }
  return reel;
}

/** React hook backing the reels feed. */
export function useReels() {
  const [reels, setReels] = useState<Reel[]>(() => mergeReels(loadLocalReels(), REEL_SEEDS));

  useEffect(() => {
    let active = true;
    fetchRemoteReels().then((remote) => {
      if (active && remote.length) {
        setReels((prev) => mergeReels(remote, prev));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const post = useCallback(async (draft: ReelDraft) => {
    const reel = await createReel(draft);
    setReels((prev) => mergeReels([reel], prev));
    return reel;
  }, []);

  return { reels, post, isLive: isSupabaseConfigured };
}
