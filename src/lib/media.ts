import { useEffect } from 'react';
import { supabase, isSupabaseConfigured, mediaPublicUrl } from './supabase';
import { useStore } from '../store/useStore';
import type { MediaStatus, StrainMedia } from '../types';

// ──────────────────────────────────────────────────────────────────────────
// Phase B — strain media (photos) backed by Supabase Storage + RLS tables.
// Every function degrades to a no-op / empty result when Supabase is unset so
// StrainCard transparently falls back to its generated art.
// ──────────────────────────────────────────────────────────────────────────

interface StrainMediaRow {
  id: string;
  strain_id: string;
  storage_path: string;
  alt_text: string | null;
  source: StrainMedia['source'];
  ai_model: string | null;
  ai_prompt: string | null;
  status: MediaStatus;
  is_primary: boolean;
  uploaded_by: string | null;
  created_at: string;
}

function rowToMedia(row: StrainMediaRow): StrainMedia {
  return {
    id: row.id,
    strainId: row.strain_id,
    storagePath: row.storage_path,
    url: mediaPublicUrl(row.storage_path),
    altText: row.alt_text ?? undefined,
    source: row.source,
    aiModel: row.ai_model ?? undefined,
    aiPrompt: row.ai_prompt ?? undefined,
    status: row.status,
    isPrimary: row.is_primary,
    uploadedBy: row.uploaded_by ?? undefined,
    createdAt: row.created_at,
  };
}

/** Build the strainId → primary-image-URL map shown across the catalog. */
export async function loadApprovedStrainMedia(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured || !supabase) return {};
  const { data, error } = await supabase
    .from('strain_media')
    .select('strain_id, storage_path, is_primary, created_at')
    .eq('status', 'approved')
    // primary first, then newest, so the reducer below keeps the best pick
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });
  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const row of data as Pick<StrainMediaRow, 'strain_id' | 'storage_path' | 'is_primary' | 'created_at'>[]) {
    if (map[row.strain_id]) continue; // first hit wins (primary/newest)
    const url = mediaPublicUrl(row.storage_path);
    if (url) map[row.strain_id] = url;
  }
  return map;
}

/** Mount once at the App root to hydrate approved strain imagery into the store. */
export function useMediaSync() {
  const setStrainMedia = useStore((s) => s.setStrainMedia);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    loadApprovedStrainMedia().then((map) => {
      if (active) setStrainMedia(map);
    });
    return () => {
      active = false;
    };
  }, [setStrainMedia]);
}

function safeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '') || 'image';
}

/** Upload a file to the media bucket and queue a pending strain_media row. */
export async function uploadStrainMedia(
  file: File,
  meta: { strainId: string; altText?: string; source?: StrainMedia['source']; aiModel?: string; aiPrompt?: string }
): Promise<{ error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { error: 'Supabase is not configured. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.' };
  }
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return { error: 'You must be signed in to upload media.' };

  const path = `strains/${meta.strainId}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const up = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (up.error) return { error: up.error.message };

  const ins = await supabase.from('strain_media').insert({
    strain_id: meta.strainId,
    storage_path: path,
    alt_text: meta.altText ?? null,
    source: meta.source ?? 'upload',
    ai_model: meta.aiModel ?? null,
    ai_prompt: meta.aiPrompt ?? null,
    status: 'pending',
    uploaded_by: userId,
  });
  if (ins.error) {
    // Roll back the orphaned object so storage doesn't drift from the table.
    await supabase.storage.from('media').remove([path]);
    return { error: ins.error.message };
  }
  return {};
}

/** Admin: fetch the moderation queue (defaults to pending). */
export async function fetchStrainMediaByStatus(status: MediaStatus = 'pending'): Promise<StrainMedia[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('strain_media')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as StrainMediaRow[]).map(rowToMedia);
}

/** Admin: approve or reject a queued item. */
export async function reviewStrainMedia(id: string, status: 'approved' | 'rejected'): Promise<{ error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase is not configured.' };
  const reviewerId = (await supabase.auth.getUser()).data.user?.id ?? null;
  const { error } = await supabase
    .from('strain_media')
    .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
    .eq('id', id);
  return error ? { error: error.message } : {};
}

/** Admin: make one image the strain's primary (unsets siblings first). */
export async function setPrimaryStrainMedia(id: string, strainId: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase is not configured.' };
  await supabase.from('strain_media').update({ is_primary: false }).eq('strain_id', strainId);
  const { error } = await supabase.from('strain_media').update({ is_primary: true }).eq('id', id);
  return error ? { error: error.message } : {};
}

/** Admin: delete a media row and its underlying object. */
export async function deleteStrainMedia(id: string, storagePath: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase is not configured.' };
  await supabase.storage.from('media').remove([storagePath]);
  const { error } = await supabase.from('strain_media').delete().eq('id', id);
  return error ? { error: error.message } : {};
}
