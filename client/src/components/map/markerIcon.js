// components/map/markerIcon.js
import L from "leaflet";

/**
 * Colored teardrop pin as a divIcon (no image assets needed).
 * Used for: selected location (red), other reported issues nearby (teal/blue).
 */
export function createPinIcon(color = "#0FA8B0") {
  const svg = `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="${color}"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "", // strip Leaflet's default icon styles
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
  });
}

export const selectedPinIcon = createPinIcon("#EF4444"); // red — the chosen location
export const nearbyPinIcon = createPinIcon("#0FA8B0"); // teal — other nearby issues
export const infoPinIcon = createPinIcon("#3B82F6"); // blue — points of interest / other markers

// Kept for anywhere still using the old default Leaflet-style icon
export const defaultMarkerIcon = selectedPinIcon;