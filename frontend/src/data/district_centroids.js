// ============================================================
// Approximate centre coordinates for Sri Lanka's 25 districts.
// Used in Quick Mode to pick the nearest district when the user
// drops a pin on the map. Offline, no external geocoding.
// ============================================================

export const DISTRICT_CENTROIDS = [
  { district: "Ampara", lat: 7.30, lng: 81.67 },
  { district: "Anuradhapura", lat: 8.35, lng: 80.40 },
  { district: "Badulla", lat: 6.99, lng: 81.06 },
  { district: "Batticaloa", lat: 7.71, lng: 81.69 },
  { district: "Colombo", lat: 6.93, lng: 79.86 },
  { district: "Galle", lat: 6.05, lng: 80.22 },
  { district: "Gampaha", lat: 7.09, lng: 80.00 },
  { district: "Hambantota", lat: 6.12, lng: 81.12 },
  { district: "Jaffna", lat: 9.66, lng: 80.02 },
  { district: "Kalutara", lat: 6.58, lng: 79.96 },
  { district: "Kandy", lat: 7.29, lng: 80.63 },
  { district: "Kegalle", lat: 7.25, lng: 80.34 },
  { district: "Kilinochchi", lat: 9.40, lng: 80.40 },
  { district: "Kurunegala", lat: 7.49, lng: 80.36 },
  { district: "Mannar", lat: 8.98, lng: 79.91 },
  { district: "Matale", lat: 7.47, lng: 80.62 },
  { district: "Matara", lat: 5.95, lng: 80.54 },
  { district: "Monaragala", lat: 6.87, lng: 81.35 },
  { district: "Mullaitivu", lat: 9.27, lng: 80.81 },
  { district: "Nuwara Eliya", lat: 6.97, lng: 80.78 },
  { district: "Polonnaruwa", lat: 7.94, lng: 81.00 },
  { district: "Puttalam", lat: 8.03, lng: 79.83 },
  { district: "Ratnapura", lat: 6.68, lng: 80.40 },
  { district: "Trincomalee", lat: 8.59, lng: 81.21 },
  { district: "Vavuniya", lat: 8.75, lng: 80.50 },
];

// Centre of Sri Lanka — default map view.
export const SRI_LANKA_CENTER = { lat: 7.87, lng: 80.77 };

/**
 * Returns the district whose centroid is closest to the given point.
 * Uses squared Euclidean distance on lat/lng — fine at this scale.
 */
export function nearestDistrict(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const c of DISTRICT_CENTROIDS) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = c.district;
    }
  }
  return best;
}
