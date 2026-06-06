// Source adapter: Washington State Liquor and Cannabis Board (WSLCB) licensed retailers.
// WA publishes licensed cannabis businesses as open public records via the WSLCB data
// portal (Socrata, https://data.lcb.wa.gov) and the Weekly Cannabis Report under
// "Frequently Requested Lists" (https://lcb.wa.gov/records/frequently-requested-lists).
// This is government open data — not a ToS-restricted menu scrape.
//
// Configure the dataset URL via env WA_LCB_DATA_URL (JSON rows endpoint, e.g. a Socrata
// resource like https://data.lcb.wa.gov/resource/<id>.json). When unset, this adapter is
// a safe no-op so the daily job never fails or invents data.
//
// Returns: Array<Partial<Dispensary>> keyed by a stable `id` (slugified license/name),
// carrying county + WSLCB compliance fields (license number/status/expiry) when present.

import { applyCountyFields } from '../lib/counties.mjs';

const slug = (s) => String(s || '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const first = (...vals) => vals.find((v) => v !== undefined && v !== null && v !== '');

// Normalize the many WSLCB status strings ("ACTIVE (ISSUED)", "PENDING", …) to our enum.
function normalizeStatus(raw, hasLicense) {
  const s = String(raw || '').toLowerCase();
  if (/suspend/.test(s)) return 'suspended';
  if (/expire/.test(s)) return 'expired';
  if (/pending|applicant|application/.test(s)) return 'pending';
  // Only claim 'active' when we actually have a license number to back it.
  if (hasLicense && /active|issued|approved/.test(s)) return 'active';
  return 'unverified';
}

// WSLCB expiry fields arrive as ISO timestamps or M/D/YYYY — emit YYYY-MM-DD or null.
function toIsoDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export async function fetchDispensaries() {
  const url = process.env.WA_LCB_DATA_URL;
  if (!url) return { ok: true, skipped: 'WA_LCB_DATA_URL unset', records: [] };
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, records: [] };
    const rows = await res.json();
    const records = (Array.isArray(rows) ? rows : []).map((r) => {
      // Field names are intentionally defensive — adjust to the chosen dataset's schema.
      const licenseNumber = first(r.license_number, r.license, r.ubi) || null;
      const hasLicense = licenseNumber != null;
      const base = {
        id: `wa-${slug(licenseNumber || r.name || r.business_name || r.tradename)}`,
        name: first(r.name, r.business_name, r.tradename),
        address: first(r.street_address, r.address, r.premises_address),
        city: r.city,
        state: 'WA',
        zip: first(r.zip, r.zip_code, r.postal_code),
        phone: first(r.phone, r.phone_number) || '',
        county: first(r.county, r.county_name),
        coordinates: r.latitude && r.longitude
          ? { lat: Number(r.latitude), lng: Number(r.longitude) }
          : undefined,
        licenseNumber: licenseNumber ? String(licenseNumber).trim() : null,
        licenseStatus: normalizeStatus(first(r.license_status, r.status, r.status_desc), hasLicense),
        licenseExpiry: toIsoDate(first(r.expiration_date, r.license_expiry, r.expdate, r.exp_date)),
        dataSource: 'wa-lcb',
      };
      return applyCountyFields(base);
    }).filter((d) => d.id && d.name && d.city);
    return { ok: true, records };
  } catch (e) {
    return { ok: false, error: e.message, records: [] };
  }
}
