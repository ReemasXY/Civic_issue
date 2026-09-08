// utils/geocoding.js
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/** Forward search: text -> list of candidate places */
export async function searchLocations(query, { countrycodes = "np", limit = 6 } = {}) {
  if (!query || query.length < 3) return [];
  const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=${limit}&countrycodes=${countrycodes}&q=${encodeURIComponent(
    query
  )}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Location search failed");
  const data = await res.json();
  return data.map((place) => ({
    label: place.display_name,
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
  }));
}

/** Reverse geocode: coords -> human-readable label */
export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { headers: { "Accept-Language": "en" } });
  if (!res.ok) throw new Error("Reverse geocode failed");
  const data = await res.json();
  return { label: data.display_name || `${lat}, ${lon}`, lat, lon };
}

