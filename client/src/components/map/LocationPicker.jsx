// components/map/LocationPicker.jsx
import React from "react";
import LocationSearchInput from "./LocationSearchInput";
import LocationPickerMap from "./LocationPickerMap";

/**
 * Bundled search input + editable map, stacked vertically.
 * Use this when you want the whole location picker in one spot
 * (e.g. a single-column form). For split layouts (search in one
 * column, map in another), use LocationSearchInput and
 * LocationPickerMap directly instead.
 */
export default function LocationPicker({
  value,
  onChange,
  height = "h-40",
  placeholder,
  nearbyMarkers = [],
}) {
  return (
    <div>
      <div className="mb-3">
        <LocationSearchInput value={value} onChange={onChange} placeholder={placeholder} />
      </div>
      <div className="rounded-lg overflow-hidden border border-slate-200">
        <LocationPickerMap
          value={value}
          onChange={onChange}
          height={height}
          nearbyMarkers={nearbyMarkers}
        />
        <div className="flex items-center px-3 py-2 bg-white text-sm border-t border-slate-100">
          <span className="text-slate-600 truncate">
            {value ? value.label : "Click the map or search to set a location"}
          </span>
        </div>
      </div>
    </div>
  );
}