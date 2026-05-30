// Source adapter: Oregon Liquor and Cannabis Commission (OLCC) licensed retailers.
// OR publishes approved marijuana retail licenses as open public records.
// Government open data — not a ToS-restricted menu scrape.
//
// Configure the dataset URL via env OR_OLCC_DATA_URL (JSON rows endpoint). When unset,
// this adapter is a safe no-op.
//
// Returns: Array<Partial<Dispensary>> keyed by a stable `id`.

const slug = (s) => String(s || '')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export async function fetchDispensaries() {
  const url = process.env.OR_OLCC_DATA_URL;
  if (!url) return { ok: true, skipped: 'OR_OLCC_DATA_URL unset', records: [] };
  try {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, records: [] };
    const rows = await res.json();
    const records = (Array.isArray(rows) ? rows : []).map((r) => ({
      id: `or-${slug(r.license_number || r.trade_name || r.business_name)}`,
      name: r.trade_name || r.business_name || r.name,
      address: r.premises_address || r.address,
      city: r.city,
      state: 'OR',
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
