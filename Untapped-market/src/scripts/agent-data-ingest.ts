import { Strain, Dispensary } from '../store/types';

/**
 * AGENT DATA INGESTION PIPELINE
 * Agents: Deposit your synthesized, non-copyright-infringing data here.
 * Format as Partial<Strain> or Partial<Dispensary> and we will merge it into mockData.ts
 */

export const agent_wa_strains: Partial<Strain>[] = [
  {
    id: 's-wa-1',
    name: 'UW Purple',
    type: 'indica',
    thc: 22.5,
    cbd: 0.2,
    source_state: 'WA',
    is_legacy: true,
    description: 'A mythical indica born in the early 90s, supposedly liberated from a university research lab. It yields dense, frost-laden purple buds with a rich, earthy aroma woven with notes of dark grapes and berries. Renowned for its profound, deeply relaxing body high.',
    effects: ['Relaxed', 'Sleepy', 'Euphoric'],
    terpenes: [
      { name: 'Myrcene', pct: 1.2, effect: 'Sedating' },
      { name: 'Caryophyllene', pct: 0.6, effect: 'Stress Relief' },
      { name: 'Pinene', pct: 0.3, effect: 'Focus' }
    ]
  },
  {
    id: 's-wa-2',
    name: 'PNW Hashplant',
    type: 'indica',
    thc: 21.0,
    cbd: 0.5,
    source_state: 'WA',
    is_legacy: true,
    description: 'A legendary foundation of Pacific Northwest cannabis culture. This stout, resilient plant produces massive amounts of sticky resin. Expect a thick, hashy smoke that delivers an immediate, numbing body buzz and intense physical relaxation.',
    effects: ['Relaxed', 'Hungry', 'Happy'],
    terpenes: [
      { name: 'Myrcene', pct: 1.5, effect: 'Sedating' },
      { name: 'Limonene', pct: 0.4, effect: 'Uplifting' }
    ]
  }
];

export const agent_or_strains: Partial<Strain>[] = [
  {
    id: 's-or-1',
    name: 'Sirius Black',
    type: 'indica',
    thc: 24.0,
    cbd: 0.1,
    source_state: 'OR',
    is_legacy: true,
    description: 'Bred in the 1980s by the Portland-based Oregon Breeders Group, this incredibly dark, almost pitch-black cultivar is a feast for the eyes. It offers a deeply sweet, jammy grape aroma and delivers a sedating, full-body euphoria.',
    effects: ['Sleepy', 'Relaxed', 'Uplifted'],
    terpenes: [
      { name: 'Linalool', pct: 0.8, effect: 'Calming' },
      { name: 'Myrcene', pct: 1.1, effect: 'Sedating' }
    ]
  },
  {
    id: 's-or-2',
    name: 'Marionberry Kush',
    type: 'hybrid',
    thc: 23.5,
    cbd: 0.3,
    source_state: 'OR',
    is_legacy: true,
    description: 'An homage to Oregon’s native blackberry cultivar, this 60/40 indica-leaning hybrid bursts with the sweet, tart aroma of freshly picked berries. The high is perfectly balanced, easing physical tension while leaving the mind sharp and creative.',
    effects: ['Creative', 'Relaxed', 'Happy'],
    terpenes: [
      { name: 'Caryophyllene', pct: 0.9, effect: 'Stress Relief' },
      { name: 'Limonene', pct: 0.7, effect: 'Uplifting' }
    ]
  },
  {
    id: 's-or-3',
    name: 'Dogwalker OG',
    type: 'hybrid',
    thc: 26.0,
    cbd: 0.1,
    source_state: 'OR',
    is_legacy: true,
    description: 'A potent cross of the heirloom Albert Walker and Chemdog 91, this cultivar earned its name from its exceptionally pungent, skunky, and earthy aroma. It delivers an incredibly strong, cerebrally focused high that melts into deep physical relaxation.',
    effects: ['Focused', 'Relaxed', 'Euphoric'],
    terpenes: [
      { name: 'Humulene', pct: 0.5, effect: 'Anti-inflammatory' },
      { name: 'Myrcene', pct: 1.0, effect: 'Sedating' }
    ]
  }
];

export const agent_dispensaries: Partial<Dispensary>[] = [
  {
    id: 'd-wa-1', name: 'Have a Heart (Belltown)', address: '115 Blanchard St', city: 'Seattle', state: 'WA',
    coordinates: { lat: 47.6136, lng: -122.3431 }, hours: '8:00 AM - 11:45 PM', rating: 4.8
  },
  {
    id: 'd-wa-2', name: 'Dockside Cannabis (SODO)', address: '1728 4th Ave S', city: 'Seattle', state: 'WA',
    coordinates: { lat: 47.5880, lng: -122.3292 }, hours: '8:00 AM - 11:30 PM', rating: 4.7
  },
  {
    id: 'd-wa-3', name: 'Shawn Kemp’s Cannabis', address: '3035 1st Ave', city: 'Seattle', state: 'WA',
    coordinates: { lat: 47.6166, lng: -122.3533 }, hours: '8:00 AM - 11:45 PM', rating: 4.9
  },
  {
    id: 'd-or-1', name: 'Happy Leaf', address: '1301 NE Broadway St', city: 'Portland', state: 'OR',
    coordinates: { lat: 45.5350, lng: -122.6517 }, hours: '10:00 AM - 10:00 PM', rating: 4.6
  },
  {
    id: 'd-or-2', name: 'Chalice Cannabis (Downtown)', address: '823 SW Naito Pkwy', city: 'Portland', state: 'OR',
    coordinates: { lat: 45.5165, lng: -122.6738 }, hours: '10:00 AM - 9:00 PM', rating: 4.8
  },
  {
    id: 'd-or-3', name: 'Farma', address: '916 SE Hawthorne Blvd', city: 'Portland', state: 'OR',
    coordinates: { lat: 45.5123, lng: -122.6565 }, hours: '10:00 AM - 9:30 PM', rating: 4.9
  }
];
