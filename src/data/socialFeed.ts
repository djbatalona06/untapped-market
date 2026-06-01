// -- Social feed mock data & types -------------------------------------------
// Types live here (not in src/types.ts per project rules)

export type PostType = 'product-drop' | 'discount' | 'influencer-review' | 'customer-review';

export interface BasePost {
  id: string;
  timestamp: string; // ISO-8601
  likes: number;
  comments: number;
}

export interface ProductDropPost extends BasePost {
  type: 'product-drop';
  brand: string;
  dispensaryName: string;
  dispensaryId: string;
  strainName: string;
  strainId: string;
  caption: string;
  imageHint: 'sativa' | 'indica' | 'hybrid' | 'cbd';
}

export interface DiscountPost extends BasePost {
  type: 'discount';
  dispensaryName: string;
  dispensaryId: string;
  dealText: string;
  code: string;
  expiry: string; // human-readable
}

export interface InfluencerReviewPost extends BasePost {
  type: 'influencer-review';
  handle: string;
  displayName: string;
  avatarEmoji: string;
  verified: boolean;
  rating: number; // 1-5
  strainName: string;
  strainId: string;
  quote: string;
  followerCount: string;
}

export interface CustomerReviewPost extends BasePost {
  type: 'customer-review';
  username: string;
  avatarInitials: string;
  rating: number; // 1-5
  strainName: string;
  strainId: string;
  body: string;
}

export type FeedPost =
  | ProductDropPost
  | DiscountPost
  | InfluencerReviewPost
  | CustomerReviewPost;

// -- Story avatars -------------------------------------------------------------

export interface StoryAvatar {
  id: string;
  label: string;
  emoji: string;
  gradientStart: string;
  gradientEnd: string;
}

export const STORY_AVATARS: StoryAvatar[] = [
  { id: 's-01', label: 'Rainier Roots', emoji: '🌿', gradientStart: '#3a8c4a', gradientEnd: '#6ca45a' },
  { id: 's-02', label: 'Cascadia Co.', emoji: '🏔', gradientStart: '#7ec0d8', gradientEnd: '#3a6080' },
  { id: 's-03', label: 'Ember & Earth', emoji: '🔥', gradientStart: '#d9a55c', gradientEnd: '#8e6826' },
  { id: 's-04', label: 'Hood River Farms', emoji: '🍊', gradientStart: '#e08040', gradientEnd: '#b04010' },
  { id: 's-05', label: 'Olympic Collective', emoji: '⛰', gradientStart: '#c08ce8', gradientEnd: '#7040a0' },
  { id: 's-06', label: 'Puget Provisions', emoji: '🌊', gradientStart: '#40c0d0', gradientEnd: '#205070' },
  { id: 's-07', label: 'Forest Park Apo.', emoji: '🌲', gradientStart: '#5a9a40', gradientEnd: '#2a5020' },
  { id: 's-08', label: 'Ballard Bloom', emoji: '🫐', gradientStart: '#6060d8', gradientEnd: '#3030a0' },
  { id: 's-09', label: 'Fremont Select', emoji: '⚡', gradientStart: '#d8a020', gradientEnd: '#a06010' },
  { id: 's-10', label: 'Snoqualmie Meds', emoji: '❄️', gradientStart: '#a8d8f0', gradientEnd: '#4080b0' },
];

// -- Helper: relative time ----------------------------------------------------

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w`;
}

// -- Mock feed posts ----------------------------------------------------------
// Timestamps are relative to 2026-06-01 (the app's "today")

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'fp-01',
    type: 'product-drop',
    brand: 'Rainier Roots',
    dispensaryName: 'Rainier Roots — Capitol Hill',
    dispensaryId: 'd-rainier-roots',
    strainName: 'Cascadia Haze',
    strainId: 'cascadia-haze',
    caption:
      "Fresh off the trim table. This batch of Cascadia Haze came in tighter than anything we've seen this season — dense, citrus-heavy, and absolutely electric. Grab it before the weekend.",
    imageHint: 'sativa',
    timestamp: '2026-06-01T10:30:00Z',
    likes: 312,
    comments: 47,
  },
  {
    id: 'fp-02',
    type: 'discount',
    dispensaryName: 'Olympic Collective',
    dispensaryId: 'd-olympic',
    dealText: '30% off all flower this weekend — including new drops. No minimum, no limit.',
    code: 'PNWFLOWER30',
    expiry: 'Sun June 2, midnight',
    timestamp: '2026-06-01T09:00:00Z',
    likes: 204,
    comments: 18,
  },
  {
    id: 'fp-03',
    type: 'influencer-review',
    handle: '@fernvalley_smokes',
    displayName: 'Fern Valley',
    avatarEmoji: '🌿',
    verified: true,
    rating: 5,
    strainName: 'Hood River Haze',
    strainId: 'hood-river-haze',
    quote:
      "Hood River Haze is everything a sativa should be — clear, focused, creative, with none of the jittery ceiling. Two sessions deep and I still have perfect recall. An actual 10.",
    followerCount: '48.2K',
    timestamp: '2026-05-31T18:45:00Z',
    likes: 891,
    comments: 133,
  },
  {
    id: 'fp-04',
    type: 'customer-review',
    username: 'nightowl_pnw',
    avatarInitials: 'NP',
    rating: 5,
    strainName: 'Rainier Kush',
    strainId: 'rainier-kush',
    body: 'Out cold in 40 minutes. Exactly what the rain and a dark evening called for. Heavy, earthy, and honest. This is the one you keep stocked for November.',
    timestamp: '2026-05-31T14:10:00Z',
    likes: 167,
    comments: 24,
  },
  {
    id: 'fp-05',
    type: 'product-drop',
    brand: 'Cascadia Co.',
    dispensaryName: 'Cascadia Co. — Fremont',
    dispensaryId: 'd-cascadia-co',
    strainName: 'Emerald City Diesel',
    strainId: 'emerald-city-diesel',
    caption:
      "Emerald City Diesel is back in rotation. Classic Pacific Northwest fuel — sharp diesel cut with a mossy finish. Limited to what we've got on shelf. Come early.",
    imageHint: 'sativa',
    timestamp: '2026-05-31T08:00:00Z',
    likes: 245,
    comments: 38,
  },
  {
    id: 'fp-06',
    type: 'discount',
    dispensaryName: 'Forest Park Apothecary',
    dispensaryId: 'd-forest-park',
    dealText: '4-for-3 on all half-grams. Mix and match across the whole menu.',
    code: 'FP4FOR3',
    expiry: 'Mon June 3, end of day',
    timestamp: '2026-05-30T20:00:00Z',
    likes: 118,
    comments: 9,
  },
  {
    id: 'fp-07',
    type: 'influencer-review',
    handle: '@pnw.rosin',
    displayName: 'PNW Rosin',
    avatarEmoji: '🔥',
    verified: true,
    rating: 4,
    strainName: 'Ballard Blueberry',
    strainId: 'ballard-blueberry',
    quote:
      "Ballard Blueberry pressed beautifully — full-melt consistency, deep berry terpenes that survive the heat. Indica lean is real but you stay functional. Solid 4 from me.",
    followerCount: '21.7K',
    timestamp: '2026-05-30T12:30:00Z',
    likes: 534,
    comments: 61,
  },
  {
    id: 'fp-08',
    type: 'customer-review',
    username: 'emeraldcity88',
    avatarInitials: 'EC',
    rating: 5,
    strainName: 'Cascadia Haze',
    strainId: 'cascadia-haze',
    body: "Perfect Saturday morning strain. Two bowls in and I spent four hours painting — best creative session in months. Citrus is unmistakable on the inhale. Zero anxiety, just pure headspace.",
    timestamp: '2026-05-29T11:00:00Z',
    likes: 142,
    comments: 19,
  },
  {
    id: 'fp-09',
    type: 'product-drop',
    brand: 'Puget Provisions',
    dispensaryName: 'Puget Provisions — Belltown',
    dispensaryId: 'd-puget',
    strainName: 'Olympic Fog',
    strainId: 'olympic-fog',
    caption:
      "Olympic Fog has landed — and it's everything the name promises. Thick terpenes, a layered hybrid profile, and visuals that'll slow your afternoon down in the best possible way.",
    imageHint: 'hybrid',
    timestamp: '2026-05-29T07:45:00Z',
    likes: 387,
    comments: 52,
  },
  {
    id: 'fp-10',
    type: 'discount',
    dispensaryName: 'Ballard Bloom',
    dispensaryId: 'd-ballard',
    dealText: 'First-time customers: 20% off your entire order. No code needed at checkout.',
    code: 'WELCOME20',
    expiry: 'Ongoing',
    timestamp: '2026-05-28T16:00:00Z',
    likes: 89,
    comments: 6,
  },
  {
    id: 'fp-11',
    type: 'influencer-review',
    handle: '@high.altitude.herb',
    displayName: 'High Altitude Herb',
    avatarEmoji: '⛰',
    verified: false,
    rating: 4,
    strainName: 'Mt. Baker Mist',
    strainId: 'mt-baker-mist',
    quote:
      "Mt. Baker Mist surprised me — lighter than it looks but the terpenes are dialed. Pine and cream on the exhale, with a clear hybrid lift that doesn't overstay its welcome.",
    followerCount: '9.4K',
    timestamp: '2026-05-28T10:15:00Z',
    likes: 276,
    comments: 34,
  },
  {
    id: 'fp-12',
    type: 'customer-review',
    username: 'bodywellness',
    avatarInitials: 'BW',
    rating: 5,
    strainName: 'Puget Sound CBD',
    strainId: 'puget-sound-cbd',
    body: "Replaced my afternoon ibuprofen with half a gram. Joint stiffness is down, head stays clear, and the rest of the work day was intact. This is what plant medicine should look like.",
    timestamp: '2026-05-27T15:30:00Z',
    likes: 256,
    comments: 41,
  },
  {
    id: 'fp-13',
    type: 'product-drop',
    brand: 'Ember & Earth',
    dispensaryName: 'Ember & Earth — Georgetown',
    dispensaryId: 'd-ember',
    strainName: 'Cherry Eastlake',
    strainId: 'cherry-eastlake',
    caption:
      'Cherry Eastlake is a limited run and we mean it. Stone fruit on the nose, a clean indica body that melts the shoulders, and just enough depth to keep you interested through the evening.',
    imageHint: 'indica',
    timestamp: '2026-05-26T19:30:00Z',
    likes: 419,
    comments: 68,
  },
  {
    id: 'fp-14',
    type: 'discount',
    dispensaryName: 'Fremont Select',
    dispensaryId: 'd-fremont',
    dealText: 'Friday Flash: Buy any eighth, get a pre-roll free. In-store only.',
    code: 'FRIDAYFLASH',
    expiry: 'Fri June 6, close',
    timestamp: '2026-05-26T08:00:00Z',
    likes: 143,
    comments: 22,
  },
];
