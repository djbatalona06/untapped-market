import type { Dispensary } from '../types';
import { STRAINS } from './strains';
import raw from './dispensaries.json';

// Data source-of-truth lives in dispensaries.json (maintained by scripts/collect.mjs).
export const DISPENSARIES: Dispensary[] = raw as unknown as Dispensary[];

// Retained for API compatibility with the prior generator module.
export const STRAINS_WITH_DISPENSARIES = STRAINS;

export function getStrainDispensaryIds(strainId: string): string[] {
  return DISPENSARIES.filter((d) => d.strainIds.includes(strainId)).map((d) => d.id);
}
