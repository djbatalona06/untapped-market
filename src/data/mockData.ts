import type { TripReport, MediaItem, NotificationItem } from '../types';

export { STRAINS } from './strains';
export { DISPENSARIES } from './dispensaries';

export const TRIP_REPORTS: TripReport[] = [
  {
    id: 'tr-001',
    strainId: 'cascadia-haze',
    userId: 'u-emeraldcity88',
    username: 'emeraldcity88',
    rating: 5,
    effects: ['Euphoric', 'Creative', 'Focused'],
    method: 'flower',
    note: 'Perfect Saturday morning strain. Two bowls and I spent four hours painting — best creative session in months. Citrus is unmistakable on the inhale. Zero anxiety, just pure headspace.',
    upvotes: 142,
    downvotes: 3,
    createdAt: '2026-04-22',
  },
  {
    id: 'tr-002',
    strainId: 'cascadia-haze',
    userId: 'u-mthood-rider',
    username: 'mthood_rider',
    rating: 4,
    effects: ['Energetic', 'Creative'],
    method: 'vape',
    note: 'Great for daytime use on the mountain. Clear-headed high with good energy. Lasted about 2 hours via vape. Slight dry mouth but manageable.',
    upvotes: 87,
    downvotes: 8,
    createdAt: '2026-05-01',
  },
  {
    id: 'tr-003',
    strainId: 'rainier-kush',
    userId: 'u-nightowlpnw',
    username: 'nightowl_pnw',
    rating: 5,
    effects: ['Sleepy', 'Relaxed', 'Hungry'],
    method: 'flower',
    note: 'Out cold in 40 minutes. This is what you reach for when the rain starts and you have nothing to do. Heavy. Be warned.',
    upvotes: 198,
    downvotes: 4,
    createdAt: '2026-05-08',
  },
  {
    id: 'tr-004',
    strainId: 'puget-sound-cbd',
    userId: 'u-bodywellness',
    username: 'bodywellness',
    rating: 5,
    effects: ['Pain relief', 'Calm', 'Clear-headed'],
    method: 'tincture',
    note: 'Replaced my afternoon ibuprofen with 0.5ml under the tongue. Joint stiffness gone, no head fog, full work day still ahead. This is what cannabis medicine should look like.',
    upvotes: 256,
    downvotes: 2,
    createdAt: '2026-05-15',
  },
  {
    id: 'tr-005',
    strainId: 'olympic-fog',
    userId: 'u-pnwpetals',
    username: 'pnwpetals',
    rating: 5,
    effects: ['Calm', 'Focused', 'Happy'],
    method: 'flower',
    note: 'Caryophyllene-forward profile lives up to it. Stress just drains out the soles of your feet. Best for end-of-week wind-down without the heavy body lock.',
    upvotes: 167,
    downvotes: 3,
    createdAt: '2026-05-19',
  },
];

export const MEDIA_ITEMS: MediaItem[] = [
  { id: 'm1', category: 'Science', title: 'How Terpinolene Shapes the Sativa Experience', thumb: '🔬', date: 'May 14' },
  { id: 'm2', category: 'PNW', title: 'Inside the Gorge: Hood River\'s Growing Scene', thumb: '🏔️', date: 'May 12' },
  { id: 'm3', category: 'How-To', title: 'Reading a Lab Certificate of Analysis', thumb: '📋', date: 'May 10' },
  { id: 'm4', category: 'Terpenes', title: 'Myrcene vs. Linalool: The Calming Duo Explained', thumb: '🌿', date: 'May 8' },
  { id: 'm5', category: 'Science', title: 'Genetic Lineage and Why It Predicts Your High', thumb: '🧬', date: 'May 6' },
  { id: 'm6', category: 'PNW', title: 'Washington\'s Craft Cannabis Farmers: A Visual Story', thumb: '🌲', date: 'May 4' },
  { id: 'm7', category: 'How-To', title: 'Building Your Personal Strain Library', thumb: '📚', date: 'May 2' },
  { id: 'm8', category: 'Terpenes', title: 'Caryophyllene: The Terpene That Acts Like a Cannabinoid', thumb: '⚗️', date: 'Apr 30' },
];

export const ETHEREAL_TOOLS: Array<{
  name: string;
  kind: 'video' | 'image' | 'audio';
  blurb: string;
  url: string;
}> = [
  {
    name: 'Runway',
    kind: 'video',
    blurb: 'Generate dreamlike cinematic strain trailers from a single prompt.',
    url: 'https://runwayml.com/',
  },
  {
    name: 'Sora',
    kind: 'video',
    blurb: 'OpenAI\'s text-to-video — render Pacific Northwest fog over evergreen canopy.',
    url: 'https://openai.com/sora',
  },
  {
    name: 'Pika',
    kind: 'video',
    blurb: 'Short ethereal loops for hero backgrounds and strain spotlight reels.',
    url: 'https://pika.art/',
  },
  {
    name: 'Luma Dream Machine',
    kind: 'video',
    blurb: 'Cinematic motion for trichome macro shots and terpene visualizations.',
    url: 'https://lumalabs.ai/dream-machine',
  },
  {
    name: 'Midjourney',
    kind: 'image',
    blurb: 'Surreal, biophilic strain art — perfect for the Untapped Market aesthetic.',
    url: 'https://www.midjourney.com/',
  },
  {
    name: 'Flux',
    kind: 'image',
    blurb: 'Photoreal botanical macros for strain hero imagery.',
    url: 'https://blackforestlabs.ai/',
  },
  {
    name: 'Ideogram',
    kind: 'image',
    blurb: 'Typography-aware label and packaging concepts.',
    url: 'https://ideogram.ai/',
  },
  {
    name: 'Suno',
    kind: 'audio',
    blurb: 'Ambient forest scores for video reels and quiz outros.',
    url: 'https://suno.com/',
  },
  {
    name: 'ElevenLabs',
    kind: 'audio',
    blurb: 'Calm, ethereal narration for guided strain experiences.',
    url: 'https://elevenlabs.io/',
  },
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-welcome',
    title: 'Welcome to Untapped Market v2.0',
    body: 'Explore 100+ verified Seattle-area dispensaries, AI strain recommendations, and live inventory alerts.',
    kind: 'system',
    read: false,
    createdAt: '2026-05-26',
  },
  {
    id: 'n-restock-1',
    title: 'Cascadia Haze restocked',
    body: 'Capitol Cannabis Co received a fresh drop. 3.5g now in stock.',
    kind: 'restock',
    strainId: 'cascadia-haze',
    read: false,
    createdAt: '2026-05-25',
  },
  {
    id: 'n-price-1',
    title: 'Price drop: Rainier Kush',
    body: 'Down $12 at Ballard Botanica through the weekend.',
    kind: 'price-drop',
    strainId: 'rainier-kush',
    read: false,
    createdAt: '2026-05-24',
  },
];

export const MOCK_GUEST_USER = {
  id: 'u-guest',
  username: 'guest',
  tier: 'free' as const,
  signedIn: false,
  preferences: {},
  consumptionLogs: [],
};
