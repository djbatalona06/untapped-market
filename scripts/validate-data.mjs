// CI/local data gate: fails (exit 1) if the JSON source-of-truth is malformed.
// Usage: node scripts/validate-data.mjs  (wired as `npm run validate:data`)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { validateStrains, validateDispensaries, validateLinks } from './lib/schema.mjs';

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data');
const read = (f) => JSON.parse(readFileSync(resolve(dataDir, f), 'utf8'));

let strains, dispensaries;
try {
  strains = read('strains.json');
  dispensaries = read('dispensaries.json');
} catch (e) {
  console.error(`✖ data not parseable: ${e.message}`);
  process.exit(1);
}

const errors = [
  ...validateStrains(strains),
  ...validateDispensaries(dispensaries),
  ...validateLinks(strains, dispensaries),
];

if (errors.length) {
  console.error(`✖ data validation failed (${errors.length} error${errors.length > 1 ? 's' : ''}):`);
  for (const e of errors.slice(0, 50)) console.error(`  - ${e}`);
  if (errors.length > 50) console.error(`  …and ${errors.length - 50} more`);
  process.exit(1);
}

console.log(`✓ data valid: ${strains.length} strains, ${dispensaries.length} dispensaries`);
