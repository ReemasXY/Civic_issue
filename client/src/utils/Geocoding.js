// utils/geocoding.js

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

function getShortLabel(address = {}) {
  const localName =
    address.neighbourhood ||
    address.suburb ||
    address.quarter ||
    address.village ||
    address.hamlet ||
    "";

  let city =
    address.city ||
    address.town ||
    address.municipality ||
    address.city_district ||
    "";

  // Remove common administrative words
  city = city
    .replace(/\s+Metropolitan City$/i, "")
    .replace(/\s+Metropolitan$/i, "")
    .replace(/\s+Municipality$/i, "")
    .replace(/\s+Municipal City$/i, "")
    .trim();

  if (
    localName &&
    city &&
    localName.toLowerCase() !==
      city.toLowerCase()
  ) {
    return `${localName}, ${city}`;
  }

  
  if (city) {
    return city;
  }

  if (localName) {
    return localName;
  }

  return "";
}

/** Forward search: text -> list of candidate places */
export async function searchLocations(
  query,
  { countrycodes = "np", limit = 6 } = {}
) {
  if (!query || query.length < 3) return [];

  const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&limit=${limit}&countrycodes=${countrycodes}&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error("Location search failed");
  }

  const data = await res.json();

  return data.map((place) => ({
    label: place.display_name,
    shortLabel: getShortLabel(place.address),
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
  }));
}

/** Reverse geocode: coords -> human-readable label */
export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`;

  const res = await fetch(url, {
    headers: {
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error("Reverse geocode failed");
  }

  const data = await res.json();

  return {
    label: data.display_name || `${lat}, ${lon}`,
    shortLabel:
      getShortLabel(data.address) ||
      data.display_name ||
      `${lat}, ${lon}`,
    lat,
    lon,
  };
}