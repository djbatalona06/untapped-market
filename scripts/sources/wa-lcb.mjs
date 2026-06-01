// Source adapter: Washington State Liquor and Cannabis Board (LCB) licensed retailers.
// WA publishes licensed cannabis businesses as open public records (Socrata/data.wa.gov).
// This is government open data — not a ToS-restricted menu scrape.
//
// Configure the dataset URL via env WA_LCB_DATA_URL (JSON rows endpoint). When unset,
// this adapter is a safe no-op so the daily job never fails or invents data.
//
// Returns: Array<Partial<Dispensary>> keyed by a stable `id` (slugified license/name).

const slug = (s) => String(s || '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export async function fetchDispensaries() {
  const url = process.env.WA_LCB_DATA_URL;
  if (!url) return { ok: true, skipped: 'WA_LCB_DATA_URL unset', records: [] };
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, records: [] };
    const rows = await res.json();
    const records = (Array.isArray(rows) ? rows : []).map((r) => ({
      // Field names are intentionally defensive — adjust to the chosen dataset's schema.
      id: `wa-${slug(r.license_number || r.ubi || r.name || r.business_name)}`,
      name: r.name || r.business_name || r.tradename,
      address: r.street_address || r.address,
      city: r.city,
      state: 'WA',
      zip: r.zip || r.zip_code,
      phone: r.phone || '',
      coordinates: r.latitude && r.longitude
        ? { lat: Number(r.latitude), lng: Number(r.longitude) }
        : undefined,
    })).filter((d) => d.id && d.name && d.city);
    return { ok: true, records };
  } catch (e) {
    return { ok: false, error: e.message, records: [] };
  }
}
