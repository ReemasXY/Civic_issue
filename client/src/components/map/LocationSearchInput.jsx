// components/map/LocationSearchInput.jsx
import React, { useState, useEffect, useRef } from "react";
import { FiMapPin } from "react-icons/fi";
import { searchLocations } from "../../utils/Geocoding.js";

/**
 * Controlled search-as-you-type location input. No map — pair it with
 * <LocationPickerMap /> sharing the same value/onChange, or use alone.
 *
 * Props:
 *  - value: { label, lat, lon } | null
 *  - onChange: (value) => void
 *  - placeholder: input placeholder text
 *  - variant: "boxed" (default, bordered input) |
 *             "inline" (compact row: pin + text, matches the
 *             "New Road, Kathmandu" mockup style)
 */
export default function LocationSearchInput({
  value,
  onChange,
  placeholder = "Search for a location...",
  variant = "boxed",
}) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value?.label]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3 || query === value?.label) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setSuggestions(await searchLocations(query));
        setIsOpen(true);
      } catch (err) {
        console.error(err);
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    onChange(place);
    setQuery(place.label);
    setIsOpen(false);
  };

  // ---- Inline variant: compact row, matches "New Road, Kathmandu" ----
  if (variant === "inline") {
    return (
      <div className="relative" ref={wrapperRef}>
        <div className="flex items-center gap-2 min-w-0">
          <FiMapPin size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full text-sm text-slate-700 placeholder:text-slate-400 bg-transparent border-none focus:outline-none truncate"
          />
        </div>

        <div className="h-px bg-slate-200 mt-2" />

        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((place, i) => (
              <li key={`${place.lat}-${place.lon}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(place)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
                >
                  {place.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ---- Boxed variant (default): bordered input ----
  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <FiMapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((place, i) => (
            <li key={`${place.lat}-${place.lon}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors cursor-pointer"
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}