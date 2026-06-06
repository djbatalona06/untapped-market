export type StrainType = 'sativa' | 'indica' | 'hybrid';
export type FormFactor = 'flower' | 'vape' | 'edibles' | 'concentrates' | 'tincture';
export type Tier = 'free' | 'premium' | 'pro';

export interface Terpene {
  name: string;
  pct: number;
  effect: string;
}

export interface Cannabinoid {
  name: string;
  value: string;
}

export interface LabData {
  lab: string;
  date: string;
  cannabinoids: Cannabinoid[];
}

export interface Lineage {
  mother: string | null;
  father: string | null;
}

export interface Strain {
  id: string;
  name: string;
  type: StrainType;
  thc: number;
  cbd: number;
  chemotype: string;
  description: string;
  terpenes: Terpene[];
  effects: string[];
  flavors: string[];
  lineage: Lineage;
  labData: LabData;
  dispensaryIds: string[];
  likeCount: number;
  color: string;
  forms?: FormFactor[];
  vibe?: Array<'sleep' | 'focus' | 'uplift' | 'relief'>;
  flavorProfile?: Array<'sweet-citrus' | 'earthen-musky' | 'pine-herbal' | 'skunk-diesel'>;
  tolerance?: 'low' | 'moderate' | 'expert';
  imageUrl?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

/** WSLCB license lifecycle. 'unverified' = a seed/demo record not yet matched
 *  to the state registry (never presented to users as a confirmed license). */
export type LicenseStatus =
  | 'active'
  | 'expired'
  | 'pending'
  | 'suspended'
  | 'unverified';

/** Provenance of a dispensary record. */
export type DispensarySource = 'wa-lcb' | 'or-olcc' | 'seed';

export interface Dispensary {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  coordinates: Coordinates;
  hours: string;
  phone: string;
  strainIds: string[];
  rating: number;
  reviewCount: number;
  tags?: string[];

  // ── County / jurisdiction (see src/lib/counties.ts) ──
  /** Canonical county name, e.g. "King". */
  county?: string;
  /** Friendly, stable filter code, e.g. "WA-KING". */
  countyCode?: string;
  /** Authoritative US Census county FIPS, e.g. "53033". */
  countyFips?: string;

  // ── WSLCB compliance fields (public-record data only) ──
  /** WSLCB marijuana retailer license number; null until verified against the state source. */
  licenseNumber?: string | null;
  /** License status per WSLCB. */
  licenseStatus?: LicenseStatus;
  /** License expiry (ISO YYYY-MM-DD) when published by the state. */
  licenseExpiry?: string | null;
  /** Where this record came from. */
  dataSource?: DispensarySource;
}

export interface TripReport {
  id: string;
  strainId: string;
  userId: string;
  username: string;
  rating: number;
  effects: string[];
  method: FormFactor;
  note: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface MediaItem {
  id: string;
  category: 'Science' | 'PNW' | 'How-To' | 'Terpenes' | 'Ethereal';
  title: string;
  thumb: string;
  date: string;
  link?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  tier: Tier;
  signedIn: boolean;
  /** True when the signed-in user has the admin role (RLS-enforced server-side). */
  isAdmin?: boolean;
  avatar?: string;
  preferences: {
    vibe?: string[];
    flavor?: string[];
    tolerance?: 'low' | 'moderate' | 'expert';
    form?: FormFactor[];
  };
  consumptionLogs: ConsumptionLog[];
}

export type MediaStatus = 'pending' | 'approved' | 'rejected';
export type MediaSource = 'upload' | 'ai-generated' | 'import';

/** A photo attached to a strain (mirrors public.strain_media). */
export interface StrainMedia {
  id: string;
  strainId: string;
  storagePath: string;
  url?: string;
  altText?: string;
  source: MediaSource;
  aiModel?: string;
  aiPrompt?: string;
  status: MediaStatus;
  isPrimary: boolean;
  uploadedBy?: string;
  createdAt: string;
}

export interface ConsumptionLog {
  id: string;
  strainId: string;
  method: FormFactor;
  dosage?: string;
  notes?: string;
  rating: number;
  createdAt: string;
}

export interface AlertSubscription {
  id: string;
  strainId: string;
  dispensaryId?: string;
  type: 'restock' | 'price-drop' | 'both';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: 'restock' | 'price-drop' | 'system' | 'community';
  strainId?: string;
  dispensaryId?: string;
  read: boolean;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  emoji: string;
  strainIds: string[];
  createdAt: string;
}

export interface QuizState {
  vibe?: 'sleep' | 'focus' | 'uplift' | 'relief';
  flavor?: 'sweet-citrus' | 'earthen-musky' | 'pine-herbal' | 'skunk-diesel';
  tolerance?: 'low' | 'moderate' | 'expert';
  form?: FormFactor;
}

export type Route =
  | { page: 'home' }
  | { page: 'catalog'; query?: string }
  | { page: 'strain'; id: string }
  | { page: 'finder'; dispensaryId?: string }
  | { page: 'library' }
  | { page: 'explore' }
  | { page: 'premium' }
  | { page: 'quiz' }
  | { page: 'account' }
  | { page: 'admin' }
  | { page: 'notifications' };
