// Untapped Market — Zustand global store.
// Persists bookmarks + likes to localStorage. Stays framework-agnostic so the
// same module can be imported by a future React Native client (which provides
// AsyncStorage via createJSONStorage).

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { DEFAULT_USER } from './mockData';
import type { AppStore, UserProfile } from './types';

interface PersistedState {
  bookmarks: string[];
  likes: string[];
  user: UserProfile;
}

interface StoreState extends AppStore {}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      bookmarks: new Set<string>(),
      likes: new Set<string>(),
      user: DEFAULT_USER,

      setBookmarks: (b: Set<string>) => set({ bookmarks: new Set(b) }),

      toggleBookmark: (id: string) => {
        const next = new Set(get().bookmarks);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        set({ bookmarks: next });
      },

      toggleLike: (id: string) => {
        const next = new Set(get().likes);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        set({ likes: next });
      },

      setUser: (u: UserProfile) => set({ user: u }),
    }),
    {
      name: 'untapped-market-store',
      storage: createJSONStorage(() => localStorage),
      // Sets aren't JSON-serializable; map to arrays on the way out and back.
      partialize: (state): PersistedState => ({
        bookmarks: Array.from(state.bookmarks),
        likes: Array.from(state.likes),
        user: state.user,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>;
        return {
          ...current,
          bookmarks: new Set(p.bookmarks ?? []),
          likes: new Set(p.likes ?? []),
          user: p.user ?? current.user,
        };
      },
    },
  ),
);

// Convenience selector hooks — encourage components to subscribe narrowly so
// they only re-render when the slice they care about changes.
export const useBookmarks = () => useStore((s) => s.bookmarks);
export const useLikes = () => useStore((s) => s.likes);
export const useUser = () => useStore((s) => s.user);
export const useToggleBookmark = () => useStore((s) => s.toggleBookmark);
export const useToggleLike = () => useStore((s) => s.toggleLike);
