// PNW availability rules — shared by the collector and the validate-pnw workflow.
//
// Goal (per product requirement): every strain shown in the app should be findable
// in the Pacific Northwest, preferably at a dispensary that appears on the map.
// "On the map" = a dispensary record with valid WA/OR coordinates.

export const PNW_STATES = new Set(['WA', 'OR']);

// Rough bounding box for WA + OR so we can reject obviously-bad geocodes that would
// drop a pin in the ocean or another state.
export const PNW_BBOX = { minLat: 41.9, maxLat: 49.1, minLng: -124.9, maxLng: -116.4 };

export function inPnwBox(coords) {
  if (!coords) return false;
  const { lat, lng } = coords;
  return (
    typeof lat === 'number' && typeof lng === 'number' &&
    lat >= PNW_BBOX.minLat && lat <= PNW_BBOX.maxLat &&
    lng >= PNW_BBOX.minLng && lng <= PNW_BBOX.maxLng
  );
}

/** A dispensary "on the map" in the PNW: WA/OR state AND coordinates inside the box. */
export function isMappablePnwDispensary(d) {
  return PNW_STATES.has(d.state) && inPnwBox(d.coordinates);
}

/**
 * Report which strains are NOT available at any mappable PNW dispensary.
 * @returns {{ orphans: string[], pnwDispensaryCount: number, mappedStrainCount: number }}
 */
export function findPnwOrphans(strains, dispensaries) {
  const mappable = dispensaries.filter(isMappablePnwDispensary);
  const stockedSomewhere = new Set();
  for (const d of mappable) for (const sid of d.strainIds || []) stockedSomewhere.add(sid);

  const orphans = strains
    .filter((s) => !stockedSomewhere.has(s.id))
    .map((s) => s.id);

  return {
    orphans,
    pnwDispensaryCount: mappable.length,
    mappedStrainCount: stockedSomewhere.size,
  };
}
