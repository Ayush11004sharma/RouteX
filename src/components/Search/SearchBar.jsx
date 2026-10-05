import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Loader2,
  Navigation,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { searchLocations } from '../../services/geocoding';
import { getPlaceTypeIcon } from './placeTypeIcons';

export const SearchBar = ({
  onSelectPlace,
  placeholder = 'Search places, cities, addresses worldwide...',
  autoFocus = false,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    setIsSearching,
    searchError,
    setSearchError,
    setSelectedPlace,
    recentSearches,
    removeRecentSearch,
    setActiveTab,
    setToPlace,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      setSearchError(null);

      try {
        const places = await searchLocations(searchQuery, {
          limit: 8,
          signal: abortControllerRef.current.signal,
        });
        setSearchResults(places);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setSearchError(err.message || 'Error fetching search results.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, setSearchResults, setIsSearching, setSearchError]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (place) => {
      setSearchQuery(place.name);
      setIsOpen(false);
      if (onSelectPlace) {
        onSelectPlace(place);
      } else {
        setSelectedPlace(place);
      }
    },
    [onSelectPlace, setSelectedPlace, setSearchQuery]
  );

  const handleKeyDown = (e) => {
    const items = searchQuery ? searchResults : recentSearches.map((r) => r.place);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && items[highlightedIndex]) {
        handleSelect(items[highlightedIndex]);
      } else if (items.length > 0) {
        handleSelect(items[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-panel border border-slate-200/80 dark:border-slate-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition duration-150">
        <div className="pl-4 pr-2 text-slate-400 dark:text-slate-500">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full py-3.5 pr-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm font-medium focus:outline-none"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={() => setActiveTab('directions')}
          className="p-2 mr-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition"
          title="Directions"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-float border border-slate-200/80 dark:border-slate-800 overflow-hidden z-[1050] max-h-[420px] overflow-y-auto">
          {searchError && (
            <div className="p-4 text-xs flex items-start gap-2.5 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {searchQuery.trim().length >= 2 && (
            <div>
              {searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Search Results ({searchResults.length})
                  </div>
                  {searchResults.map((place, idx) => {
                    const PlaceIcon = getPlaceTypeIcon(place.category, place.type);
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <div
                        key={place.id}
                        onClick={() => handleSelect(place)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`flex items-start gap-3.5 px-4 py-3 cursor-pointer transition ${
                          isHighlighted
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-950 dark:text-blue-100'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="mt-0.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <PlaceIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {place.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {place.displayName}
                          </div>
                          {place.type && (
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                              {place.type.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setToPlace(place);
                            setActiveTab('directions');
                            setIsOpen(false);
                          }}
                          className="self-center p-2 text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                          title="Get directions to here"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !isSearching && (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      No results found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <p className="text-xs mt-1">
                      Check spelling or try a broader search like city, landmark, or street name.
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          {!searchQuery.trim() && (
            <div className="py-2">
              <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Recent Searches
                </span>
              </div>
              {recentSearches.length > 0 ? (
                recentSearches.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.place)}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-slate-800 dark:text-slate-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="truncate">
                        <span className="text-sm font-medium">{item.place.name}</span>
                        <span className="text-xs text-slate-400 ml-2 truncate">
                          {item.place.address?.city || item.place.address?.country || ''}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(item.id);
                      }}
                      className="p-1 text-slate-300 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  Search for cities, landmarks, addresses or businesses worldwide
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
