// components/map/LocationPickerMap.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { selectedPinIcon, nearbyPinIcon } from "./markerIcon";
import { reverseGeocode } from "../../utils/Geocoding.js";

const DEFAULT_CENTER = [27.7172, 85.324]; // Kathmandu

/**
 * Controlled editable map — click anywhere to drop/move the pin
 * (reverse-geocoded into a label). Pair with <LocationSearchInput />
 * sharing the same value/onChange.
 *
 * Props:
 *  - value: { label, lat, lon } | null — the currently selected/pinned location
 *  - onChange: (value) => void
 *  - height: tailwind height class, e.g. "h-56" (default) or "h-72".
 *    Prefer a fixed height (h-56, h-64, h-72, h-80) over "h-full" when this
 *    is placed inside a flex/grid column — Leaflet measures its container
 *    on first paint, and flex/grid parents can report 0px height on that
 *    first paint, leaving the map blank.
 *  - nearbyMarkers: optional [{ id, lat, lon, label }] — e.g. other reported
 *    issues nearby, shown as teal pins for spatial context
 */
export default function LocationPickerMap({
  value,
  onChange,
  height = "h-56",
  nearbyMarkers = [],
}) {
  const center = value ? [value.lat, value.lon] : DEFAULT_CENTER;

  const handleMapClick = async (lat, lon) => {
    try {
      const place = await reverseGeocode(lat, lon);
      onChange(place);
    } catch (err) {
      onChange({ label: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon });
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={value ? 15 : 13}
      scrollWheelZoom={false}
      className={`${height} w-full`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {nearbyMarkers.map((m) => (
        <Marker key={m.id ?? `${m.lat}-${m.lon}`} position={[m.lat, m.lon]} icon={nearbyPinIcon}>
          {m.label && <Popup>{m.label}</Popup>}
        </Marker>
      ))}

      {value && <Marker position={[value.lat, value.lon]} icon={selectedPinIcon} />}

      <ClickToSetPin onPick={handleMapClick} />
      <RecenterOnChange target={value} />
      <InvalidateSizeOnMount />
    </MapContainer>
  );
}

function ClickToSetPin({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterOnChange({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lon], 15, { duration: 0.8 });
  }, [target, map]);
  return null;
}

/**
 * Leaflet measures its container size once on mount. In flex/grid layouts
 * the container can report an incorrect size on that first paint (before
 * the browser finishes laying out siblings), leaving the map blank. This
 * forces a re-measure shortly after mount and on window resize.
 */
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 100);
    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);
  return null;
}