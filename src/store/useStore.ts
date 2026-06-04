import { create } from 'zustand';
import type {
  AlertSubscription,
  ConsumptionLog,
  Folder,
  NotificationItem,
  QuizState,
  Route,
  Tier,
  TripReport,
  UserProfile,
} from '../types';
import { MOCK_GUEST_USER, SEED_NOTIFICATIONS, TRIP_REPORTS } from '../data/mockData';

interface Toast {
  id: number;
  msg: string;
  fading: boolean;
}

interface AppState {
  route: Route;
  navigate: (r: Route) => void;

  user: UserProfile;
  signIn: (username: string, email?: string) => void;
  signOut: () => void;
  signUp: (username: string, email: string) => void;
  /** True once the initial auth check (Supabase session restore) has resolved. */
  authReady: boolean;
  setAuthReady: (ready: boolean) => void;
  /** Replace the active user from a resolved Supabase session (null = signed out). */
  setSessionUser: (user: UserProfile | null) => void;
  upgradeTier: (tier: Tier) => void;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  logConsumption: (log: Omit<ConsumptionLog, 'id' | 'createdAt'>) => void;

  /** strainId → public URL of the primary approved image (Supabase media). */
  strainMedia: Record<string, string>;
  setStrainMedia: (media: Record<string, string>) => void;

  bookmarks: Set<string>;
  toggleBookmark: (strainId: string) => boolean;

  folders: Folder[];
  createFolder: (name: string, emoji: string) => void;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  addToFolder: (folderId: string, strainId: string) => void;
  removeFromFolder: (folderId: string, strainId: string) => void;

  alerts: AlertSubscription[];
  toggleAlert: (strainId: string, type?: AlertSubscription['type'], dispensaryId?: string) => boolean;
  isAlerted: (strainId: string, dispensaryId?: string) => boolean;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  pushNotification: (n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;

  tripReports: TripReport[];
  postTripReport: (r: Omit<TripReport, 'id' | 'createdAt' | 'upvotes' | 'downvotes'>) => void;
  upvoteReport: (id: string) => void;

  quiz: QuizState;
  setQuiz: (patch: Partial<QuizState>) => void;
  resetQuiz: () => void;

  toasts: Toast[];
  addToast: (msg: string) => void;

  notificationCenterOpen: boolean;
  setNotificationCenterOpen: (open: boolean) => void;

  tweaksOpen: boolean;
  setTweaksOpen: (open: boolean) => void;

  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
}

let toastCounter = 1;

export const useStore = create<AppState>((set, get) => ({
  route: { page: 'home' },
  navigate: (r) => {
    set({ route: r });
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  },

  user: MOCK_GUEST_USER,
  signIn: (username, email) =>
    set({
      user: {
        id: 'u-' + username.toLowerCase(),
        username,
        email,
        tier: 'free',
        signedIn: true,
        preferences: {},
        consumptionLogs: [],
      },
    }),
  signOut: () => set({ user: MOCK_GUEST_USER }),
  signUp: (username, email) =>
    set({
      user: {
        id: 'u-' + username.toLowerCase(),
        username,
        email,
        tier: 'free',
        signedIn: true,
        preferences: {},
        consumptionLogs: [],
      },
    }),
  authReady: false,
  setAuthReady: (authReady) => set({ authReady }),
  setSessionUser: (user) => set({ user: user ?? MOCK_GUEST_USER }),

  strainMedia: {},
  setStrainMedia: (strainMedia) => set({ strainMedia }),

  upgradeTier: (tier) => set((s) => ({ user: { ...s.user, tier } })),
  updatePreferences: (prefs) =>
    set((s) => ({ user: { ...s.user, preferences: { ...s.user.preferences, ...prefs } } })),
  logConsumption: (log) =>
    set((s) => ({
      user: {
        ...s.user,
        consumptionLogs: [
          ...s.user.consumptionLogs,
          { ...log, id: 'cl-' + Date.now(), createdAt: new Date().toISOString().slice(0, 10) },
        ],
      },
    })),

  bookmarks: new Set<string>(),
  toggleBookmark: (strainId) => {
    const next = new Set(get().bookmarks);
    const added = !next.has(strainId);
    if (added) next.add(strainId);
    else next.delete(strainId);
    set({ bookmarks: next });
    return added;
  },

  folders: [
    {
      id: 'f-favorites',
      name: 'My Favorites',
      emoji: '⭐',
      strainIds: [],
      createdAt: '2026-05-01',
    },
  ],
  createFolder: (name, emoji) =>
    set((s) => ({
      folders: [
        ...s.folders,
        {
          id: 'f-' + Date.now(),
          name,
          emoji,
          strainIds: [],
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    })),
  renameFolder: (id, name) =>
    set((s) => ({ folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)) })),
  deleteFolder: (id) => set((s) => ({ folders: s.folders.filter((f) => f.id !== id) })),
  addToFolder: (folderId, strainId) =>
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === folderId && !f.strainIds.includes(strainId)
          ? { ...f, strainIds: [...f.strainIds, strainId] }
          : f
      ),
    })),
  removeFromFolder: (folderId, strainId) =>
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === folderId ? { ...f, strainIds: f.strainIds.filter((id) => id !== strainId) } : f
      ),
    })),

  alerts: [],
  toggleAlert: (strainId, type = 'both', dispensaryId) => {
    const existing = get().alerts.find(
      (a) => a.strainId === strainId && a.dispensaryId === dispensaryId
    );
    if (existing) {
      set((s) => ({ alerts: s.alerts.filter((a) => a.id !== existing.id) }));
      return false;
    }
    set((s) => ({
      alerts: [
        ...s.alerts,
        {
          id: 'a-' + Date.now(),
          strainId,
          dispensaryId,
          type,
          createdAt: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    return true;
  },
  isAlerted: (strainId, dispensaryId) =>
    get().alerts.some((a) => a.strainId === strainId && a.dispensaryId === dispensaryId),

  notifications: SEED_NOTIFICATIONS,
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: 'n-' + Date.now(),
          read: false,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...s.notifications,
      ],
    })),

  tripReports: TRIP_REPORTS,
  postTripReport: (r) =>
    set((s) => ({
      tripReports: [
        {
          ...r,
          id: 'tr-' + Date.now(),
          upvotes: 0,
          downvotes: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...s.tripReports,
      ],
    })),
  upvoteReport: (id) =>
    set((s) => ({
      tripReports: s.tripReports.map((t) => (t.id === id ? { ...t, upvotes: t.upvotes + 1 } : t)),
    })),

  quiz: {},
  setQuiz: (patch) => set((s) => ({ quiz: { ...s.quiz, ...patch } })),
  resetQuiz: () => set({ quiz: {} }),

  toasts: [],
  addToast: (msg) => {
    const id = toastCounter++;
    set((s) => ({ toasts: [...s.toasts, { id, msg, fading: false }] }));
    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.map((t) => (t.id === id ? { ...t, fading: true } : t)),
      }));
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, 350);
    }, 2500);
  },

  notificationCenterOpen: false,
  setNotificationCenterOpen: (open) => set({ notificationCenterOpen: open }),

  tweaksOpen: false,
  setTweaksOpen: (open) => set({ tweaksOpen: open }),

  authModalOpen: false,
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
}));

export function unreadCount(notifs: NotificationItem[]): number {
  return notifs.filter((n) => !n.read).length;
}
