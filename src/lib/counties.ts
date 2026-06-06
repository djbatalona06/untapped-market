// County registry + query helpers for the client/API filtering layer.
// Mirrors scripts/lib/counties.mjs (Node pipeline). Keep the two in sync.
//
// The app filters dispensaries by county. A query for "King County" must return
// ONLY King-County dispensaries — never the other counties — unless the caller
// explicitly asks for "All".

import type { Dispensary } from '../types';

export interface County {
  /** Canonical name, e.g. "King". */
  name: string;
  /** Friendly, stable code used in URLs/UI/filters, e.g. "WA-KING". */
  code: string;
  /** Authoritative US Census county FIPS, e.g. "53033". */
  fips: string;
}

// The five Puget Sound counties the app currently features, in display order.
export const COUNTIES: County[] = [
  { name: 'King', code: 'WA-KING', fips: '53033' },
  { name: 'Pierce', code: 'WA-PIERCE', fips: '53053' },
  { name: 'Snohomish', code: 'WA-SNOHOMISH', fips: '53061' },
  { name: 'Kitsap', code: 'WA-KITSAP', fips: '53035' },
  { name: 'Thurston', code: 'WA-THURSTON', fips: '53067' },
];

export const COUNTY_BY_CODE: Record<string, County> = Object.fromEntries(
  COUNTIES.map((c) => [c.code, c]),
);

/** Selection passed to the filter: "All", a single code, or an explicit list. */
export type CountySelection = 'All' | string | string[];

/** Chip options for the finder UI: "All" plus each featured county. */
export const COUNTY_FILTER_OPTIONS: Array<{ label: string; value: CountySelection }> = [
  { label: 'All', value: 'All' },
  ...COUNTIES.map((c) => ({ label: c.name, value: c.code })),
];

/**
 * Filter dispensaries by county. This is the single chokepoint that enforces
 * "a King-County query never leaks the other four counties".
 *
 *   queryByCounty(list, 'All')        → every dispensary
 *   queryByCounty(list, 'WA-KING')    → King County only
 *   queryByCounty(list, ['WA-KING','WA-PIERCE']) → King + Pierce only
 */
export function queryByCounty(dispensaries: Dispensary[], selection: CountySelection): Dispensary[] {
  if (selection === 'All') return dispensaries;
  const wanted = new Set(Array.isArray(selection) ? selection : [selection]);
  return dispensaries.filter((d) => d.countyCode != null && wanted.has(d.countyCode));
}
