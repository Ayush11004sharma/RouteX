import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Locate, MapPin } from 'lucide-react';
import { searchLocations } from '../../services/geocoding';
import { useAppStore } from '../../stores/useAppStore';

export const RouteLocationInput = ({
  value,
  onChange,
  placeholder,
  dotColor,
}) => {
  const { requestUserLocation } = useAppStore();
  const [query, setQuery] = useState(value ? value.name : '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value ? value.name : '');
  }, [value]);

  useEffect(() => {
    if (!query || query === value?.name || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const places = await searchLocations(query, { limit: 5 });
        setResults(places);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseCurrentLocation = async () => {
    const loc = await requestUserLocation();
    if (loc) {
      const userPlace = {
        id: 'user_current_location',
        name: 'Your Location',
        displayName: loc.address || 'Current GPS Location',
        lat: loc.lat,
        lng: loc.lng,
      };
      onChange(userPlace);
      setQuery('Your Location');
      setIsOpen(false);
    }
  };

  const handleSelect = (place) => {
    onChange(place);
    setQuery(place.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700/80 focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition">
        <div className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} />

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (value && e.target.value !== value.name) {
              onChange(null);
            }
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />}

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
            title="Clear"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition"
            title="Use current location"
          >
            <Locate className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-float border border-slate-200 dark:border-slate-800 overflow-hidden z-[1100] max-h-56 overflow-y-auto">
          {results.map((place) => (
            <div
              key={place.id}
              onClick={() => handleSelect(place)}
              className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {place.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {place.displayName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
