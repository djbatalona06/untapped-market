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
}

export interface Coordinates {
  lat: number;
  lng: number;
}

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
  avatar?: string;
  preferences: {
    vibe?: string[];
    flavor?: string[];
    tolerance?: 'low' | 'moderate' | 'expert';
    form?: FormFactor[];
  };
  consumptionLogs: ConsumptionLog[];
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
  | { page: 'notifications' };
