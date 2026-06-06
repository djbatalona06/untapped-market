// Zero-dependency runtime validator for the JSON data source-of-truth.
// Shared by scripts/validate-data.mjs (CI gate) and scripts/collect.mjs (daily agent)
// so malformed data can never be committed or deployed.

import { ALL_COUNTY_CODES, WA_COUNTY_FIPS, countyCodeFor } from './counties.mjs';

const STRAIN_TYPES = new Set(['sativa', 'indica', 'hybrid']);
const LICENSE_STATUSES = new Set(['active', 'expired', 'pending', 'suspended', 'unverified']);
const DATA_SOURCES = new Set(['wa-lcb', 'or-olcc', 'seed']);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LICENSE_NO = /^[A-Za-z0-9-]{3,20}$/;

const isStr = (v) => typeof v === 'string';
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isArr = (v) => Array.isArray(v);

/** @returns {string[]} list of human-readable errors (empty = valid) */
export function validateStrains(strains) {
  const errors = [];
  if (!isArr(strains)) return ['strains: root is not an array'];
  const ids = new Set();
  strains.forEach((s, i) => {
    const at = `strain[${i}]${s && s.id ? `(${s.id})` : ''}`;
    if (!s || typeof s !== 'object') return errors.push(`${at}: not an object`);
    if (!isStr(s.id)) errors.push(`${at}: id must be string`);
    else if (ids.has(s.id)) errors.push(`${at}: duplicate id`);
    else ids.add(s.id);
    if (!isStr(s.name)) errors.push(`${at}: name must be string`);
    if (!STRAIN_TYPES.has(s.type)) errors.push(`${at}: type must be sativa|indica|hybrid`);
    if (!isNum(s.thc)) errors.push(`${at}: thc must be number`);
    if (!isNum(s.cbd)) errors.push(`${at}: cbd must be number`);
    if (!isStr(s.chemotype)) errors.push(`${at}: chemotype must be string`);
    if (!isStr(s.description)) errors.push(`${at}: description must be string`);
    if (!isArr(s.terpenes)) errors.push(`${at}: terpenes must be array`);
    else s.terpenes.forEach((t, j) => {
      if (!isStr(t?.name) || !isNum(t?.pct) || !isStr(t?.effect))
        errors.push(`${at}.terpenes[${j}]: needs {name:string, pct:number, effect:string}`);
    });
    if (!isArr(s.effects) || !s.effects.every(isStr)) errors.push(`${at}: effects must be string[]`);
    if (!isArr(s.flavors) || !s.flavors.every(isStr)) errors.push(`${at}: flavors must be string[]`);
    if (!s.lineage || !('mother' in s.lineage) || !('father' in s.lineage))
      errors.push(`${at}: lineage must be {mother, father}`);
    if (!s.labData || !isStr(s.labData.lab) || !isStr(s.labData.date) || !isArr(s.labData.cannabinoids))
      errors.push(`${at}: labData must be {lab:string, date:string, cannabinoids:[]}`);
    if (!isArr(s.dispensaryIds) || !s.dispensaryIds.every(isStr)) errors.push(`${at}: dispensaryIds must be string[]`);
    if (!isNum(s.likeCount)) errors.push(`${at}: likeCount must be number`);
    if (!isStr(s.color)) errors.push(`${at}: color must be string`);
  });
  return errors;
}

/** @returns {string[]} list of human-readable errors (empty = valid) */
export function validateDispensaries(dispensaries) {
  const errors = [];
  if (!isArr(dispensaries)) return ['dispensaries: root is not an array'];
  const ids = new Set();
  const licenseOwners = new Map(); // license_number -> dispensary id (uniqueness gate)
  dispensaries.forEach((d, i) => {
    const at = `dispensary[${i}]${d && d.id ? `(${d.id})` : ''}`;
    if (!d || typeof d !== 'object') return errors.push(`${at}: not an object`);
    if (!isStr(d.id)) errors.push(`${at}: id must be string`);
    else if (ids.has(d.id)) errors.push(`${at}: duplicate id`);
    else ids.add(d.id);
    for (const k of ['name', 'address', 'city', 'state', 'zip', 'hours', 'phone'])
      if (!isStr(d[k])) errors.push(`${at}: ${k} must be string`);
    if (!d.coordinates || !isNum(d.coordinates.lat) || !isNum(d.coordinates.lng))
      errors.push(`${at}: coordinates must be {lat:number, lng:number}`);
    if (!isArr(d.strainIds) || !d.strainIds.every(isStr)) errors.push(`${at}: strainIds must be string[]`);
    if (!isNum(d.rating)) errors.push(`${at}: rating must be number`);
    if (!isNum(d.reviewCount)) errors.push(`${at}: reviewCount must be number`);

    // ── County / jurisdiction (validated when present; backward compatible) ──
    if (d.county !== undefined && !WA_COUNTY_FIPS[d.county])
      errors.push(`${at}: county "${d.county}" is not a known WA county`);
    if (d.countyCode !== undefined && !ALL_COUNTY_CODES.has(d.countyCode))
      errors.push(`${at}: countyCode "${d.countyCode}" is not a valid WA-XXX code`);
    if (d.countyFips !== undefined && WA_COUNTY_FIPS[d.county] !== d.countyFips)
      errors.push(`${at}: countyFips "${d.countyFips}" does not match county "${d.county}"`);
    if (d.county !== undefined && d.countyCode !== undefined && countyCodeFor(d.county) !== d.countyCode)
      errors.push(`${at}: countyCode "${d.countyCode}" inconsistent with county "${d.county}"`);

    // ── WSLCB compliance fields (validated when present) ──
    if (d.licenseStatus !== undefined && !LICENSE_STATUSES.has(d.licenseStatus))
      errors.push(`${at}: licenseStatus "${d.licenseStatus}" invalid`);
    if (d.dataSource !== undefined && !DATA_SOURCES.has(d.dataSource))
      errors.push(`${at}: dataSource "${d.dataSource}" invalid`);
    if (d.licenseExpiry != null && (!isStr(d.licenseExpiry) || !ISO_DATE.test(d.licenseExpiry)))
      errors.push(`${at}: licenseExpiry must be ISO date YYYY-MM-DD or null`);
    if (d.licenseNumber != null) {
      if (!isStr(d.licenseNumber) || !LICENSE_NO.test(d.licenseNumber)) {
        errors.push(`${at}: licenseNumber must be null or a 3–20 char alphanumeric code`);
      } else if (licenseOwners.has(d.licenseNumber)) {
        errors.push(`${at}: licenseNumber "${d.licenseNumber}" already used by ${licenseOwners.get(d.licenseNumber)}`);
      } else {
        licenseOwners.set(d.licenseNumber, d.id);
      }
    }
    // Integrity: an ACTIVE license must carry a verified license number.
    if (d.licenseStatus === 'active' && d.licenseNumber == null)
      errors.push(`${at}: licenseStatus 'active' requires a licenseNumber`);
  });
  return errors;
}

/** Cross-reference check: every foreign key resolves. */
export function validateLinks(strains, dispensaries) {
  const errors = [];
  const sIds = new Set(strains.map((s) => s.id));
  const dIds = new Set(dispensaries.map((d) => d.id));
  for (const d of dispensaries)
    for (const sid of d.strainIds || [])
      if (!sIds.has(sid)) errors.push(`dispensary(${d.id}): unknown strainId ${sid}`);
  for (const s of strains)
    for (const did of s.dispensaryIds || [])
      if (!dIds.has(did)) errors.push(`strain(${s.id}): unknown dispensaryId ${did}`);
  return errors;
}
