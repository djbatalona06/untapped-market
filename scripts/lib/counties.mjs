// Washington county registry + resolver — shared by the collector, the WSLCB
// source adapter, and the data validator so every dispensary row carries an
// accurate, deterministic county code.
//
// Why this exists: the product needs to filter dispensaries by county (King,
// Pierce, Snohomish, Kitsap, Thurston, …). Rather than invent an arbitrary
// "WA-0001" scheme, we anchor each county to its authoritative US Census FIPS
// code (the real, dedupe-safe identifier) and expose a human-readable alias
// (`WA-KING`) for URLs and UI chips.
//
//   county     -> "King"
//   countyCode -> "WA-KING"   (friendly, stable, used by the API/UI filter)
//   countyFips -> "53033"     (authoritative; the source of truth for identity)

// Full WA FIPS table (53001–53077). Authoritative; used to stamp any row whose
// county we can name, even outside the five Puget Sound counties we feature.
export const WA_COUNTY_FIPS = {
  Adams: '53001', Asotin: '53003', Benton: '53005', Chelan: '53007',
  Clallam: '53009', Clark: '53011', Columbia: '53013', Cowlitz: '53015',
  Douglas: '53017', Ferry: '53019', Franklin: '53021', Garfield: '53023',
  Grant: '53025', 'Grays Harbor': '53027', Island: '53029', Jefferson: '53031',
  King: '53033', Kitsap: '53035', Kittitas: '53037', Klickitat: '53039',
  Lewis: '53041', Lincoln: '53043', Mason: '53045', Okanogan: '53047',
  Pacific: '53049', 'Pend Oreille': '53051', Pierce: '53053', 'San Juan': '53055',
  Skagit: '53057', Skamania: '53059', Snohomish: '53061', Spokane: '53063',
  Stevens: '53065', Thurston: '53067', Wahkiakum: '53069', 'Walla Walla': '53071',
  Whatcom: '53073', Whitman: '53075', Yakima: '53077',
};

/** Friendly, stable county code from a county name. "Grays Harbor" -> "WA-GRAYSHARBOR". */
export function countyCodeFor(name) {
  if (!name) return undefined;
  return 'WA-' + String(name).toUpperCase().replace(/[^A-Z]/g, '');
}

// Approximate county centroids (lat/lng) for a coordinate fallback when a row
// has no usable city/county text. Last resort only — source-provided county and
// the city map below are both more accurate near county borders.
const CENTROIDS = {
  King: [47.49, -121.83], Kitsap: [47.64, -122.65], Pierce: [47.04, -122.14],
  Snohomish: [48.05, -121.77], Thurston: [46.93, -122.83], Mason: [47.35, -123.18],
  Jefferson: [47.80, -123.55], Clallam: [48.10, -123.93], Island: [48.16, -122.62],
  Skagit: [48.49, -121.77], Whatcom: [48.83, -121.84], Lewis: [46.58, -122.39],
  Clark: [45.78, -122.48], Cowlitz: [46.19, -122.68], Kittitas: [47.12, -120.68],
  Spokane: [47.62, -117.40], Yakima: [46.46, -120.74], Benton: [46.23, -119.51],
};

// City → county for Puget Sound. Primary resolver for our seed data and for any
// WSLCB row that lists a city but not a county.
export const CITY_COUNTY = {
  // King
  Seattle: 'King', Bellevue: 'King', Kirkland: 'King', Redmond: 'King',
  Renton: 'King', Kent: 'King', Burien: 'King', Tukwila: 'King',
  'Federal Way': 'King', Shoreline: 'King', Bothell: 'King', Auburn: 'King',
  SeaTac: 'King', Sammamish: 'King', Issaquah: 'King', Woodinville: 'King',
  Kenmore: 'King', 'Des Moines': 'King', 'Maple Valley': 'King', Covington: 'King',
  Snoqualmie: 'King', 'North Bend': 'King', 'Mercer Island': 'King', Newcastle: 'King',
  Enumclaw: 'King', 'Lake Forest Park': 'King', 'Normandy Park': 'King',
  // Pierce
  Tacoma: 'Pierce', Puyallup: 'Pierce', Lakewood: 'Pierce', 'Gig Harbor': 'Pierce',
  'University Place': 'Pierce', 'Bonney Lake': 'Pierce', Sumner: 'Pierce',
  Spanaway: 'Pierce', Parkland: 'Pierce', Fife: 'Pierce', Edgewood: 'Pierce',
  Milton: 'Pierce', Steilacoom: 'Pierce', DuPont: 'Pierce', Graham: 'Pierce',
  Frederickson: 'Pierce', Orting: 'Pierce',
  // Snohomish
  Everett: 'Snohomish', Lynnwood: 'Snohomish', Marysville: 'Snohomish',
  Edmonds: 'Snohomish', 'Lake Stevens': 'Snohomish', Mukilteo: 'Snohomish',
  'Mill Creek': 'Snohomish', Monroe: 'Snohomish', Snohomish: 'Snohomish',
  Arlington: 'Snohomish', Stanwood: 'Snohomish', 'Mountlake Terrace': 'Snohomish',
  Brier: 'Snohomish', 'Granite Falls': 'Snohomish', Sultan: 'Snohomish',
  'Gold Bar': 'Snohomish', Darrington: 'Snohomish',
  // Kitsap
  Bremerton: 'Kitsap', Silverdale: 'Kitsap', 'Port Orchard': 'Kitsap',
  Poulsbo: 'Kitsap', 'Bainbridge Island': 'Kitsap', Kingston: 'Kitsap',
  Suquamish: 'Kitsap',
  // Thurston
  Olympia: 'Thurston', Lacey: 'Thurston', Tumwater: 'Thurston', Yelm: 'Thurston',
  Tenino: 'Thurston', Rainier: 'Thurston', Bucoda: 'Thurston',
};

function nearestCountyByCoords(coords) {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return undefined;
  let best, bestD = Infinity;
  for (const [name, [lat, lng]] of Object.entries(CENTROIDS)) {
    const d = (lat - coords.lat) ** 2 + (lng - coords.lng) ** 2;
    if (d < bestD) { bestD = d; best = name; }
  }
  return best;
}

/**
 * Resolve a county name for a dispensary-like record.
 * Priority: explicit county (trusted source field) → city map → nearest centroid.
 * @returns {string|undefined} canonical county name, or undefined if unknown.
 */
export function resolveCountyName(d) {
  if (!d) return undefined;
  if (d.county && WA_COUNTY_FIPS[d.county]) return d.county;
  if (d.city && CITY_COUNTY[d.city]) return CITY_COUNTY[d.city];
  return nearestCountyByCoords(d.coordinates);
}

/**
 * Non-destructive: fill county / countyCode / countyFips when missing or stale.
 * Existing, source-provided values win and are normalized for consistency.
 */
export function applyCountyFields(d) {
  const name = resolveCountyName(d);
  if (!name) return d;
  return {
    ...d,
    county: name,
    countyCode: countyCodeFor(name),
    countyFips: WA_COUNTY_FIPS[name],
  };
}

// The five Puget Sound counties the app features (for validators / UI parity).
export const FEATURED_COUNTY_CODES = new Set([
  'WA-KING', 'WA-PIERCE', 'WA-SNOHOMISH', 'WA-KITSAP', 'WA-THURSTON',
]);

// Every valid county code statewide (for format validation).
export const ALL_COUNTY_CODES = new Set(Object.keys(WA_COUNTY_FIPS).map(countyCodeFor));
