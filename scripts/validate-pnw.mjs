// PNW availability gate: every strain must be stocked at >=1 mappable WA/OR dispensary.
// Usage: node scripts/validate-pnw.mjs  (wired as `npm run validate:pnw`)
// Exits 1 if any strain is orphaned (not findable on the PNW map).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { findPnwOrphans } from './lib/pnw.mjs';

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data');
const read = (f) => JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));

const strains = read('strains.json');
const dispensaries = read('dispensaries.json');

const { orphans, pnwDispensaryCount, mappedStrainCount } = findPnwOrphans(strains, dispensaries);

console.log(`PNW map: ${pnwDispensaryCount} mappable WA/OR dispensaries, ${mappedStrainCount} strains stocked.`);

if (orphans.length) {
  console.error(`✖ ${orphans.length} strain(s) not findable at any mappable PNW dispensary:`);
  for (const id of orphans.slice(0, 50)) console.error(`  - ${id}`);
  if (orphans.length > 50) console.error(`  …and ${orphans.length - 50} more`);
  process.exit(1);
}

console.log(`✓ all ${strains.length} strains are findable at a PNW dispensary on the map`);
