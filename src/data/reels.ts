// -- Reels feed data & types --------------------------------------------------
// Types live here (not in src/types.ts), matching the social-feed convention.
//
// The Explore tab is a full-screen, vertical "reels" experience with a warm
// roots-reggae / one-love aesthetic. Anyone — people, brands, influencers —
// can post a clip. Seeds below are original, reggae-culture-flavored vibes
// (no real-person likeness or trademarks).

export type ReelAuthorType = 'person' | 'brand' | 'influencer';

export interface Reel {
  id: string;
  authorType: ReelAuthorType;
  authorName: string;
  handle: string;
  avatar: string; // emoji or single initial
  verified: boolean;
  caption: string;
  hashtags: string[];
  track: string; // "Artist — Track"
  /**
   * Visual source. Either `photo:<file-in-/img>` for a bundled photo backdrop
   * or any other string used as a deterministic seed for a generated
   * roots-tricolor gradient. Keeps reels alive with zero network dependency.
   */
  bg: string;
  likes: number;
  comments: number;
  shares: number;
  location?: string;
  createdAt: string; // ISO-8601
}

export interface ReelDraft {
  authorType: ReelAuthorType;
  authorName: string;
  handle: string;
  caption: string;
  hashtags: string[];
  track: string;
  bg: string;
}

// -- Author-type chrome -------------------------------------------------------

export const AUTHOR_BADGE: Record<ReelAuthorType, { label: string; emoji: string }> = {
  person: { label: 'Community', emoji: '🌍' },
  brand: { label: 'Brand', emoji: '🏷️' },
  influencer: { label: 'Creator', emoji: '⭐' },
};

// -- Roots tricolor gradient generator ---------------------------------------
// Green / gold / red, the colors of the vibe. Deterministic per seed so every
// reel (including ones users post) gets a distinct, animated backdrop.

function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const ROOTS_STOPS: Array<[string, string, string]> = [
  ['#0c3b1e', '#e8b21a', '#9e1f1f'], // green → gold → red
  ['#123d1f', '#1f7a3a', '#e8b21a'], // forest → green → gold
  ['#7a1414', '#e8b21a', '#0c3b1e'], // red → gold → green
  ['#0b2e26', '#0e7a5a', '#e8b21a'], // teal-green → gold
  ['#3a1208', '#9e1f1f', '#e8b21a'], // ember → red → gold
];

/** A CSS `background` value for a reel — bundled photo or generated gradient. */
export function reelBackground(bg: string): { backgroundImage: string; isPhoto: boolean } {
  if (bg.startsWith('photo:')) {
    const file = bg.slice('photo:'.length);
    return { backgroundImage: `url("/img/${file}")`, isPhoto: true };
  }
  const seed = fnv1a(bg);
  const [a, b, c] = ROOTS_STOPS[seed % ROOTS_STOPS.length];
  const angle = 120 + (seed % 90);
  return {
    backgroundImage: `linear-gradient(${angle}deg, ${a} 0%, ${b} 52%, ${c} 100%)`,
    isPhoto: false,
  };
}

// -- Relative time ------------------------------------------------------------

export function reelRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

// -- Seed reels ---------------------------------------------------------------
// Timestamps relative to the app's "today" (2026-06-03).

export const REEL_SEEDS: Reel[] = [
  {
    id: 'rl-01',
    authorType: 'brand',
    authorName: 'One Love Organics',
    handle: '@onelove.organics',
    avatar: '🌿',
    verified: true,
    caption:
      'Sun-grown, hand-trimmed, cured with patience. This week’s drop of Lion’s Mane Haze is pure positive vibration. One love. 🦁',
    hashtags: ['onelove', 'sungrown', 'craftcannabis', 'pnw'],
    track: 'Roots Collective — Stir It Up (Dub)',
    bg: 'photo:hero-macro.jpg',
    likes: 4820,
    comments: 312,
    shares: 188,
    location: 'Humboldt, CA',
    createdAt: '2026-06-03T08:10:00Z',
  },
  {
    id: 'rl-02',
    authorType: 'influencer',
    authorName: 'Irie Vibes',
    handle: '@irie.vibes',
    avatar: '✨',
    verified: true,
    caption:
      'Smoke break with a view 🌅 Cascadia Haze hits different on a slow morning. Tag who you’d share this sunrise session with. #everylittlething',
    hashtags: ['irie', 'sativa', 'morningsesh', 'goodvibes'],
    track: 'High Tide Riddim — Positive Vibration',
    bg: 'photo:hero-smoke.jpg',
    likes: 12740,
    comments: 904,
    shares: 657,
    location: 'Portland, OR',
    createdAt: '2026-06-02T16:30:00Z',
  },
  {
    id: 'rl-03',
    authorType: 'person',
    authorName: 'Marcus T.',
    handle: '@marcus.grows',
    avatar: 'M',
    verified: false,
    caption:
      'Day 54 of flower in the home tent 🌱 first time running an autoflower and she’s frosty. Roots music in the grow room, no stress, just growth.',
    hashtags: ['homegrow', 'growmie', 'autoflower'],
    track: 'Dub Lions — Jammin in the Garden',
    bg: 'rootsy-soul',
    likes: 980,
    comments: 142,
    shares: 36,
    location: 'Seattle, WA',
    createdAt: '2026-06-02T11:05:00Z',
  },
  {
    id: 'rl-04',
    authorType: 'brand',
    authorName: 'Zion Gardens',
    handle: '@ziongardens',
    avatar: '🦁',
    verified: true,
    caption:
      'Behind the cure: 60 days in glass, burped daily, terps locked in. Quality over everything. Get up, stand up for good flower. 🔥',
    hashtags: ['curedright', 'terps', 'qualityoverquantity'],
    track: 'Mighty Roots — Get Up Stand Up (Rework)',
    bg: 'emberton',
    likes: 6310,
    comments: 421,
    shares: 240,
    location: 'Ashland, OR',
    createdAt: '2026-06-01T19:45:00Z',
  },
  {
    id: 'rl-05',
    authorType: 'influencer',
    authorName: 'Jada — Higher Living',
    handle: '@higher.living',
    avatar: '🌺',
    verified: true,
    caption:
      'Three things I look for in a strain ✌️ terps, lineage, and how it makes me FEEL. Rainier Kush for the wind-down. Save this for your next dispo run.',
    hashtags: ['strainreview', 'indica', 'selfcare', 'onelove'],
    track: 'Sister Mariah — Three Little Birds (Lo-Fi)',
    bg: 'goldenhour',
    likes: 9120,
    comments: 538,
    shares: 401,
    location: 'Tacoma, WA',
    createdAt: '2026-06-01T14:20:00Z',
  },
  {
    id: 'rl-06',
    authorType: 'person',
    authorName: 'Dre',
    handle: '@dre.eastside',
    avatar: 'D',
    verified: false,
    caption:
      'First time at a reggae night since the move and the whole block was irie 🎶 found my new favorite local brand too. Community is everything.',
    hashtags: ['community', 'reggaenight', 'locallove'],
    track: 'Live @ The Greenhouse — Roots Session',
    bg: 'photo:hero-hands.jpg',
    likes: 1540,
    comments: 96,
    shares: 58,
    location: 'Bellevue, WA',
    createdAt: '2026-05-31T22:10:00Z',
  },
  {
    id: 'rl-07',
    authorType: 'brand',
    authorName: 'Rasta Roots Co.',
    handle: '@rastaroots.co',
    avatar: '🟢',
    verified: true,
    caption:
      'New pre-roll packs landed 🌟 hemp wraps, glass tips, all natural. Roll one up, put the worries down. Limited weekend drop at partner shops.',
    hashtags: ['preroll', 'newdrop', 'weekendvibes'],
    track: 'Tuff Gong Sound — Could You Be Loved (Dub Mix)',
    bg: 'tricolor-classic',
    likes: 5230,
    comments: 287,
    shares: 173,
    location: 'Eugene, OR',
    createdAt: '2026-05-31T09:00:00Z',
  },
  {
    id: 'rl-08',
    authorType: 'influencer',
    authorName: 'Kofi Green',
    handle: '@kofi.green',
    avatar: '🎧',
    verified: true,
    caption:
      'Sunday sound system + a slow-burning hybrid = the reset I needed 🔊 Drop your go-to wind-down track below. Every little thing gonna be alright.',
    hashtags: ['soundsystem', 'hybrid', 'sundayreset'],
    track: 'Kofi Green — Redemption Dub',
    bg: 'deepforest',
    likes: 8870,
    comments: 612,
    shares: 359,
    location: 'Olympia, WA',
    createdAt: '2026-05-30T20:30:00Z',
  },
];
