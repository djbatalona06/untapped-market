// Untapped Market — Shared TypeScript types
// These shapes are mirrored by the Supabase schema in /supabase/schema.sql.

export interface UserProfile {
  id: string;
  username: string;
  showRealName: boolean;
  realName?: string;
  tier: 'free' | 'premium';
}

export interface Terpene {
  name: string;
  pct: number;
  effect: string;
}

export interface LabCertificateCannabinoid {
  name: string;
  value: string;
}

export interface LabCertificate {
  lab: string;
  date: string;
  cannabinoids: LabCertificateCannabinoid[];
}

export interface MediaItem {
  id: string;
  category: string;
  title: string;
  thumb: string;
  date: string;
}

export interface StrainLineage {
  mother: string | null;
  father: string | null;
}

export interface Strain {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid';
  thc: number;
  cbd: number;
  terpenes: Terpene[];
  effects: string[];
  flavors: string[];
  lineage: StrainLineage;
  labData: LabCertificate;
  dispensaryIds: string[];
  likeCount: number;
  chemotype: string;
  description: string;
  color: string;
  source_state?: 'WA' | 'OR' | string;
  is_legacy?: boolean;
}

export interface DispensaryCoordinates {
  lat: number;
  lng: number;
}

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  city: string;
  state: 'WA' | 'OR';
  coordinates: DispensaryCoordinates;
  hours: string;
  strainIds: string[];
  rating: number;
  phone: string;
}

export interface TripReport {
  id: string;
  strainId: string;
  userId: string;
  username: string;
  rating: 1 | 2 | 3 | 4 | 5;
  effects: string[];
  method: 'flower' | 'edible' | 'concentrate' | 'vape' | 'other';
  note: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  hidden?: boolean;
}

export interface AppStore {
  bookmarks: Set<string>;
  setBookmarks: (b: Set<string>) => void;
  toggleBookmark: (id: string) => void;
  likes: Set<string>;
  toggleLike: (id: string) => void;
  user: UserProfile;
  setUser: (u: UserProfile) => void;
}
