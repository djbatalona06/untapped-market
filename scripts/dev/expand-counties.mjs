// One-shot: seed demo dispensary pins so all five featured counties
// (King, Pierce, Snohomish, Kitsap, Thurston) are represented on the map.
//
// These are DEMO records (reserved 555 phone numbers, no license number,
// licenseStatus 'unverified', dataSource 'seed') — they exist only so the
// county filter/map have data to show before the WSLCB open-data import is
// switched on. They are never presented to users as verified licenses.
//
// Idempotent: re-running skips pins whose id already exists. After running,
// `npm run collect` stamps county codes + compliance defaults and recomputes links.
//   node scripts/dev/expand-counties.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const file = resolve(dirname(fileURLToPath(import.meta.url)), '../../src/data/dispensaries.json');

// Known-good strain ids (present in src/data/strains.json) to stock the demo pins.
const STOCK = ['puget-sound-cbd', 'olympic-fog', 'ballard-blueberry', 'afghan-pnw', 'wonderland-mints', 'tacoma-tangerine'];

const mk = (id, name, address, city, zip, lat, lng, phone, tags) => ({
  id, name, address, city, state: 'WA', zip,
  coordinates: { lat, lng },
  hours: 'Mon–Sun 9am–10pm', phone,
  strainIds: [...STOCK],
  rating: 4.4, reviewCount: 120, tags,
});

const NEW_PINS = [
  // Kitsap (53035) — previously unrepresented
  mk('disp-kitsap-1', 'Sound View Cannabis', '2381 Wheaton Way', 'Bremerton', '98337', 47.5673, -122.6329, '(360) 555-2210', ['Curbside', 'Veteran Discount']),
  mk('disp-kitsap-2', 'Silverdale Green Co', '9978 Silverdale Way NW', 'Silverdale', '98383', 47.6445, -122.6949, '(360) 555-3398', ['Delivery', 'Daily Deals']),
  mk('disp-kitsap-3', 'Sinclair Inlet Botanicals', '714 Bay St', 'Port Orchard', '98366', 47.5404, -122.6362, '(360) 555-4471', ['Recreational', 'ATM']),
  mk('disp-kitsap-4', 'Liberty Bay Leaf', '18887 Front St NE', 'Poulsbo', '98370', 47.7362, -122.6465, '(360) 555-5520', ['Medical', 'Loyalty Program']),
  // Thurston (53067) — previously unrepresented
  mk('disp-thurston-1', 'Capitol Lake Cannabis', '410 Capitol Way S', 'Olympia', '98501', 47.0379, -122.9007, '(360) 555-6612', ['Curbside', 'Medical']),
  mk('disp-thurston-2', 'Lacey Leaf Collective', '4520 Pacific Ave SE', 'Lacey', '98503', 47.0343, -122.8232, '(360) 555-7733', ['Delivery', 'Recreational']),
  mk('disp-thurston-3', 'Tumwater Falls Botanicals', '305 Custer Way SW', 'Tumwater', '98501', 47.0073, -122.9093, '(360) 555-8845', ['Daily Deals', 'ATM']),
  // Pierce (53053) — bolster
  mk('disp-pierce-1', 'Puyallup Valley Greens', '1102 E Main', 'Puyallup', '98372', 47.1854, -122.2929, '(253) 555-1190', ['Curbside', 'Loyalty Program']),
  mk('disp-pierce-2', 'Lakewood Leaf Co', '5915 100th St SW', 'Lakewood', '98499', 47.1718, -122.5185, '(253) 555-2284', ['Delivery', 'Veteran Discount']),
  // Snohomish (53061) — bolster
  mk('disp-snoho-1', 'Port Gardner Cannabis', '2818 Rucker Ave', 'Everett', '98201', 47.9790, -122.2021, '(425) 555-3370', ['Recreational', 'Curbside']),
  mk('disp-snoho-2', 'Marysville Market Greens', '1525 State Ave', 'Marysville', '98270', 48.0518, -122.1771, '(360) 555-4419', ['Medical', 'Daily Deals']),
];

const list = JSON.parse(readFileSync(file, 'utf8'));
const have = new Set(list.map((d) => d.id));
const added = NEW_PINS.filter((p) => !have.has(p.id));
list.push(...added);
writeFileSync(file, JSON.stringify(list, null, 2) + '\n');
console.log(`✓ expand-counties: +${added.length} demo pins (total ${list.length})`);
