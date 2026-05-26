import type { Dispensary } from '../types';
import { STRAINS } from './strains';

interface NeighborhoodSeed {
  city: string;
  state: string;
  zipBase: string;
  center: { lat: number; lng: number };
  spread: number;
  names: string[];
  streetPool: string[];
  areaCode: string;
}

const NEIGHBORHOODS: NeighborhoodSeed[] = [
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98102',
    center: { lat: 47.6219, lng: -122.3208 },
    spread: 0.012,
    names: [
      'Capitol Cannabis Co',
      'Pike-Pine Apothecary',
      'Hilltop Holistic',
      'Broadway Bud Bar',
      'Volunteer Park Cannabis',
      'Cal Anderson Collective',
      'Olive Way Organics',
      'Madison Park Mary',
    ],
    streetPool: ['15th Ave E', 'E Pine St', 'Broadway E', 'E Olive Way', '12th Ave', 'E Madison St'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98134',
    center: { lat: 47.5793, lng: -122.3286 },
    spread: 0.008,
    names: ['SODO Smoke Shop', 'Industrial Indica', 'Warehouse Wellness', 'Stadium District Cannabis', 'Sounder Selects'],
    streetPool: ['1st Ave S', 'Airport Way S', 'Utah Ave S', '4th Ave S'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98107',
    center: { lat: 47.6685, lng: -122.3839 },
    spread: 0.01,
    names: ['Ballard Botanica', 'Salmon Bay Cannabis', 'Market Street Greens', 'Locks & Leaves', 'Nordic Cannabis Co', 'Shilshole Selects'],
    streetPool: ['NW Market St', 'Ballard Ave NW', '24th Ave NW', '15th Ave NW'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98103',
    center: { lat: 47.6516, lng: -122.3486 },
    spread: 0.009,
    names: ['Fremont Cannabis Collective', 'Troll Bridge Botanicals', 'Lenin Lane Leaf', 'Gas Works Greens', 'Adobe District Apothecary'],
    streetPool: ['N 36th St', 'Fremont Ave N', 'N 34th St', 'Stone Way N'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98105',
    center: { lat: 47.6587, lng: -122.3138 },
    spread: 0.011,
    names: ['U District Dispensary', 'Husky Cannabis Co', 'Ave Apothecary', 'Ravenna Reserve', 'Burke-Gilman Buds'],
    streetPool: ['University Way NE', 'NE 45th St', 'NE 50th St', '15th Ave NE'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98133',
    center: { lat: 47.6878, lng: -122.3514 },
    spread: 0.008,
    names: ['Greenwood Greens', 'Phinney Ridge Reserve', 'North Cannabis Co'],
    streetPool: ['Greenwood Ave N', 'N 85th St', 'N 65th St'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98106',
    center: { lat: 47.5165, lng: -122.3504 },
    spread: 0.012,
    names: ['White Center Wellness', 'Top Hat Cannabis', 'Westwood Botanicals'],
    streetPool: ['SW Roxbury St', '16th Ave SW', 'Delridge Way SW'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98108',
    center: { lat: 47.5476, lng: -122.3164 },
    spread: 0.009,
    names: ['Georgetown Greenhouse', 'Boeing Field Botanicals', 'Airport Way Apothecary'],
    streetPool: ['Airport Way S', 'E Marginal Way S', 'S Bailey St'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98125',
    center: { lat: 47.7196, lng: -122.2918 },
    spread: 0.01,
    names: ['Lake City Leaf', 'Cedar Park Cannabis', 'Northgate Holistic'],
    streetPool: ['Lake City Way NE', 'NE 125th St', '35th Ave NE'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98116',
    center: { lat: 47.5707, lng: -122.3870 },
    spread: 0.012,
    names: ['West Seattle Wellness', 'Alki Apothecary', 'California Avenue Cannabis', 'Admiral District Buds', 'Junction Botanicals', 'Lincoln Park Leaf'],
    streetPool: ['California Ave SW', 'SW Alaska St', 'SW Admiral Way', 'Fauntleroy Way SW'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98121',
    center: { lat: 47.6149, lng: -122.3464 },
    spread: 0.006,
    names: ['Belltown Botanicals', 'Pike Place Provisions', 'Seattle Center Cannabis'],
    streetPool: ['1st Ave', '2nd Ave', '5th Ave'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98109',
    center: { lat: 47.6249, lng: -122.3367 },
    spread: 0.005,
    names: ['SLU Cannabis Co', 'Amazon-District Apothecary'],
    streetPool: ['Westlake Ave N', 'Mercer St'],
    areaCode: '206',
  },
  {
    city: 'Seattle',
    state: 'WA',
    zipBase: '98118',
    center: { lat: 47.5407, lng: -122.2696 },
    spread: 0.014,
    names: ['Rainier Valley Reserve', 'Columbia City Cannabis', 'Hillman City Holistic'],
    streetPool: ['Rainier Ave S', 'MLK Jr Way S', 'S Henderson St'],
    areaCode: '206',
  },
  {
    city: 'Bellevue',
    state: 'WA',
    zipBase: '98004',
    center: { lat: 47.6101, lng: -122.2015 },
    spread: 0.015,
    names: [
      'Bellevue Botanicals',
      'Downtown Bellevue Cannabis',
      'Crossroads Cannabis Co',
      'Factoria Flower',
      'Eastgate Apothecary',
    ],
    streetPool: ['NE 8th St', '116th Ave NE', '148th Ave SE', 'Bel-Red Rd'],
    areaCode: '425',
  },
  {
    city: 'Kirkland',
    state: 'WA',
    zipBase: '98033',
    center: { lat: 47.6815, lng: -122.2087 },
    spread: 0.014,
    names: ['Kirkland Cannabis Collective', 'Lake Washington Leaf', 'Totem Lake Botanicals', 'Juanita Bay Buds'],
    streetPool: ['Lake Street S', 'Central Way', 'NE 116th St', '124th Ave NE'],
    areaCode: '425',
  },
  {
    city: 'Redmond',
    state: 'WA',
    zipBase: '98052',
    center: { lat: 47.6740, lng: -122.1215 },
    spread: 0.015,
    names: ['Redmond Reserve', 'Microsoft District Microdose', 'Sammamish River Cannabis', 'Marymoor Mary Jane'],
    streetPool: ['NE Redmond Way', 'Cleveland St', '148th Ave NE', 'Avondale Way NE'],
    areaCode: '425',
  },
  {
    city: 'Renton',
    state: 'WA',
    zipBase: '98057',
    center: { lat: 47.4829, lng: -122.2171 },
    spread: 0.017,
    names: ['Renton Botanicals', 'Boeing Plant Cannabis', 'Coulon Park Provisions', 'Highlands Holistic', 'Fairwood Flower'],
    streetPool: ['S 3rd St', 'Sunset Blvd NE', 'NE 4th St', 'Rainier Ave S'],
    areaCode: '425',
  },
  {
    city: 'Burien',
    state: 'WA',
    zipBase: '98148',
    center: { lat: 47.4707, lng: -122.3467 },
    spread: 0.013,
    names: ['Burien Buds', 'Three Tree Point Cannabis', 'Boulevard Park Botanicals', 'SeaTac Selects'],
    streetPool: ['SW 152nd St', 'Ambaum Blvd SW', '1st Ave S', '4th Ave SW'],
    areaCode: '206',
  },
  {
    city: 'Lynnwood',
    state: 'WA',
    zipBase: '98036',
    center: { lat: 47.8279, lng: -122.3051 },
    spread: 0.015,
    names: ['Lynnwood Leaf', 'Alderwood Apothecary', 'Mountlake Cannabis Co', 'Edmonds Edge'],
    streetPool: ['196th St SW', '44th Ave W', 'Highway 99', '184th St SW'],
    areaCode: '425',
  },
  {
    city: 'Shoreline',
    state: 'WA',
    zipBase: '98133',
    center: { lat: 47.7549, lng: -122.3415 },
    spread: 0.011,
    names: ['Shoreline Cannabis', 'Aurora Avenue Apothecary', 'Echo Lake Edibles'],
    streetPool: ['Aurora Ave N', 'N 175th St', '15th Ave NE'],
    areaCode: '206',
  },
  {
    city: 'Bothell',
    state: 'WA',
    zipBase: '98011',
    center: { lat: 47.7623, lng: -122.2054 },
    spread: 0.013,
    names: ['Bothell Botanicals', 'North Creek Cannabis', 'Canyon Park Provisions'],
    streetPool: ['Bothell Way NE', 'Main St', '228th St SE'],
    areaCode: '425',
  },
  {
    city: 'Kent',
    state: 'WA',
    zipBase: '98032',
    center: { lat: 47.3809, lng: -122.2348 },
    spread: 0.016,
    names: ['Kent Cannabis Collective', 'East Hill Holistic', 'Showare Selects', 'Meeker Street Mary'],
    streetPool: ['Central Ave S', 'W Meeker St', 'E James St', '104th Ave SE'],
    areaCode: '253',
  },
  {
    city: 'Federal Way',
    state: 'WA',
    zipBase: '98003',
    center: { lat: 47.3223, lng: -122.3126 },
    spread: 0.014,
    names: ['Federal Way Flower', 'Twin Lakes Cannabis', 'Dash Point Dispensary'],
    streetPool: ['S 320th St', 'Pacific Hwy S', 'SW Campus Dr'],
    areaCode: '253',
  },
  {
    city: 'Tukwila',
    state: 'WA',
    zipBase: '98168',
    center: { lat: 47.4739, lng: -122.2607 },
    spread: 0.011,
    names: ['Tukwila Trichome', 'Southcenter Cannabis'],
    streetPool: ['Strander Blvd', 'Tukwila Pkwy'],
    areaCode: '206',
  },
  {
    city: 'Tacoma',
    state: 'WA',
    zipBase: '98402',
    center: { lat: 47.2529, lng: -122.4443 },
    spread: 0.018,
    names: ['Tacoma Top Shelf', 'Stadium District Cannabis', '6th Avenue Apothecary', 'Hilltop Heritage Cannabis', 'Point Defiance Provisions'],
    streetPool: ['Pacific Ave', '6th Ave', 'N 1st St', 'S 19th St', 'MLK Jr Way'],
    areaCode: '253',
  },
];

const HOUR_VARIANTS = [
  'Mon–Sat 9am–10pm · Sun 10am–8pm',
  'Daily 8am–11pm',
  'Daily 9am–10pm',
  'Mon–Sat 10am–9pm · Sun 11am–7pm',
  'Daily 8am–10pm',
];

const TAG_POOL = [
  'Medical-friendly',
  'Veteran discount',
  'Curbside pickup',
  'ATM on-site',
  'First-time deals',
  'Late night',
  'Concentrates specialist',
  'Edibles focus',
  'CBD-forward',
  'Craft growers',
  'Tour-friendly',
];

function pseudoRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickTags(seed: number): string[] {
  const count = 2 + (seed % 3);
  const tags = new Set<string>();
  for (let i = 0; i < count; i++) {
    tags.add(TAG_POOL[(seed * (i + 7)) % TAG_POOL.length]);
  }
  return Array.from(tags);
}

function generateDispensaries(): Dispensary[] {
  const out: Dispensary[] = [];
  const strainIds = STRAINS.map(s => s.id);
  let seed = 1;

  for (const hood of NEIGHBORHOODS) {
    for (let i = 0; i < hood.names.length; i++) {
      seed++;
      const r1 = pseudoRand(seed);
      const r2 = pseudoRand(seed * 3);
      const r3 = pseudoRand(seed * 7);
      const r4 = pseudoRand(seed * 11);

      const lat = hood.center.lat + (r1 - 0.5) * hood.spread;
      const lng = hood.center.lng + (r2 - 0.5) * hood.spread;

      const streetNum = 100 + Math.floor(r3 * 9000);
      const street = hood.streetPool[i % hood.streetPool.length];

      const phone = `(${hood.areaCode}) 555-${String(1000 + Math.floor(r4 * 8999)).padStart(4, '0')}`;

      const stockCount = 4 + Math.floor(r1 * 6);
      const stocked = new Set<string>();
      for (let j = 0; j < stockCount; j++) {
        stocked.add(strainIds[(seed * (j + 13)) % strainIds.length]);
      }

      const rating = Math.round((4.0 + r2 * 1.0) * 10) / 10;
      const reviewCount = 40 + Math.floor(r3 * 1200);

      const id = `${hood.city.toLowerCase().replace(/\s+/g, '-')}-${i}-${seed}`;

      out.push({
        id,
        name: hood.names[i],
        address: `${streetNum} ${street}`,
        city: hood.city,
        state: hood.state,
        zip: hood.zipBase,
        coordinates: { lat, lng },
        hours: HOUR_VARIANTS[seed % HOUR_VARIANTS.length],
        phone,
        strainIds: Array.from(stocked),
        rating,
        reviewCount,
        tags: pickTags(seed),
      });
    }
  }
  return out;
}

export const DISPENSARIES: Dispensary[] = generateDispensaries();

const dispByStrain = new Map<string, string[]>();
for (const d of DISPENSARIES) {
  for (const sid of d.strainIds) {
    if (!dispByStrain.has(sid)) dispByStrain.set(sid, []);
    dispByStrain.get(sid)!.push(d.id);
  }
}
for (const s of STRAINS) {
  s.dispensaryIds = dispByStrain.get(s.id) ?? [];
}
