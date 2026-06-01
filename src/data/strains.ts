import type { Strain } from '../types';
import raw from './strains.json';

// Data source-of-truth lives in strains.json (maintained by scripts/collect.mjs).
export const STRAINS: Strain[] = raw as unknown as Strain[];
