// Untapped Market — store barrel.
// Re-export types, mock data, and the Zustand hook for clean imports
// elsewhere: `import { useStore, STRAINS, type Strain } from '@/store'`.

export * from './types';
export * from './mockData';
export {
  useStore,
  useBookmarks,
  useLikes,
  useUser,
  useToggleBookmark,
  useToggleLike,
} from './useStore';
