// One-time seed: convert the authoritative TS data into JSON source-of-truth files.
// Run once with `node scripts/dev/extract-data.mjs`. After this, the JSON files are
// canonical and the daily collector (scripts/collect.mjs) maintains them.
//
// This script does NOT depend on TS tooling or the network. It:
//   1. Evaluates the STRAINS array literal out of src/data/strains.ts
//   2. Evaluates the NEIGHBORHOODS literal out of src/data/dispensaries.ts and
//      re-runs the exact deterministic generator (seed 42) to reproduce dispensaries
//   3. Computes bidirectional strain<->dispensary links
//   4. Writes src/data/strains.json and src/data/dispensaries.json

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../../src/data');

/** Evaluate a JS array literal that follows `marker` in `source` up to the matching `\n];`. */
function evalArrayLiteral(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`marker not found: ${marker}`);
  const from = start + marker.length;
  const end = source.indexOf('\n];', from);
  if (end === -1) throw new Error(`array end not found after: ${marker}`);
  const literal = source.slice(from, end + 2); // include closing `]`
  // eslint-disable-next-line no-eval
  return eval(`(${literal})`);
}

// --- 1. Strains ---------------------------------------------------------------
const strainsTs = readFileSync(resolve(dataDir, 'strains.ts'), 'utf8');
const strains = evalArrayLiteral(strainsTs, 'export const STRAINS: Strain[] =');

// --- 2. Dispensaries (reproduce the deterministic generator) ------------------
const dispTs = readFileSync(resolve(dataDir, 'dispensaries.ts'), 'utf8');
const NEIGHBORHOODS = evalArrayLiteral(dispTs, 'const NEIGHBORHOODS: NeighborhoodSeed[] =');

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}
const rng = makeRng(42);
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];
const TAG_POOL = ['Recreational', 'Medical', 'Delivery', 'ATM', 'Veteran Discount', 'Daily Deals', 'Curbside', 'Loyalty Program'];

const dispensaries = [];
let idCounter = 1;
for (const hood of NEIGHBORHOODS) {
  for (const name of hood.names) {
    const r1 = rng(), r2 = rng(), r3 = rng(), r4 = rng(), r5 = rng();
    const lat = hood.center.lat + (r1 - 0.5) * hood.spread * 2;
    const lng = hood.center.lng + (r2 - 0.5) * hood.spread * 2;
    const streetNum = 100 + Math.floor(r3 * 9900);
    const street = pick(hood.streetPool, r4);
    const zipSuffix = Math.floor(r5 * 90 + 10);
    const strainCount = 3 + Math.floor(rng() * 6);
    const strainIds = [];
    for (let i = 0; i < strainCount; i++) strainIds.push(pick(strains, rng()).id);
    dispensaries.push({
      id: `disp-${idCounter++}`,
      name,
      address: `${streetNum} ${street}`,
      city: hood.city,
      state: hood.state,
      zip: `${hood.zipBase.slice(0, 3)}${zipSuffix}`,
      coordinates: { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) },
      hours: pick(['Mon–Sun 8am–10pm', 'Mon–Sat 9am–9pm · Sun 10am–7pm', 'Daily 9am–11pm', 'Mon–Sun 10am–10pm'], rng()),
      phone: `(${hood.areaCode}) 555-${String(Math.floor(rng() * 9000) + 1000)}`,
      strainIds: [...new Set(strainIds)],
      rating: Number((3.8 + rng() * 1.2).toFixed(1)),
      reviewCount: Math.floor(rng() * 480) + 20,
      tags: [...new Set([pick(TAG_POOL, rng()), pick(TAG_POOL, rng())])],
    });
  }
}

// --- 3. Bidirectional links ---------------------------------------------------
for (const s of strains) {
  s.dispensaryIds = dispensaries.filter((d) => d.strainIds.includes(s.id)).map((d) => d.id);
}

// --- 4. Write JSON ------------------------------------------------------------
writeFileSync(resolve(dataDir, 'strains.json'), JSON.stringify(strains, null, 2) + '\n');
writeFileSync(resolve(dataDir, 'dispensaries.json'), JSON.stringify(dispensaries, null, 2) + '\n');

console.log(`strains=${strains.length} dispensaries=${dispensaries.length}`);
