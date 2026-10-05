import React from 'react';
import {
  X,
  Search,
  Loader2,
  MapPin,
  Utensils,
  Coffee,
  Hospital,
  Pill,
  Fuel,
  CreditCard,
  Hotel,
  ShoppingCart,
  Compass,
  Trees,
  Navigation,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { NEARBY_CATEGORIES } from '../../constants';

const CATEGORY_ICON_MAP = {
  Utensils,
  Coffee,
  Hospital,
  Pill,
  Fuel,
  CreditCard,
  Hotel,
  ShoppingCart,
  Compass,
  Trees,
};

export const NearbyPanel = () => {
  const {
    activeNearbyCategory,
    nearbyResults,
    isNearbyLoading,
    searchNearbyCategory,
    clearNearby,
    setSelectedPlace,
    setToPlace,
    setActiveTab,
  } = useAppStore();

  const currentCategory = NEARBY_CATEGORIES.find((c) => c.id === activeNearbyCategory);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Explore Nearby Places
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discover real points of interest around the current area
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('search')}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Category Chips Grid */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {NEARBY_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.icon] || MapPin;
            const isSelected = activeNearbyCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => searchNearbyCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {isNearbyLoading && (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Searching nearby {currentCategory?.name || 'places'}...
          </p>
        </div>
      )}

      {/* Results list */}
      {!isNearbyLoading && nearbyResults.length > 0 && (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Found {nearbyResults.length} {currentCategory?.name || 'places'}
            </span>
            <button
              onClick={clearNearby}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2.5">
            {nearbyResults.map((place) => (
              <div
                key={place.id}
                onClick={() => setSelectedPlace(place)}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {place.displayName}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setToPlace(place);
                      setActiveTab('directions');
                    }}
                    className="p-2 bg-white dark:bg-slate-700 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-xs border border-slate-200 dark:border-slate-600 transition shrink-0"
                    title="Directions"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Additional tags if present */}
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {place.extratags?.cuisine && (
                    <span className="text-[10px] font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full capitalize">
                      {place.extratags.cuisine.replace(/;/g, ', ')}
                    </span>
                  )}
                  {place.extratags?.brand && (
                    <span className="text-[10px] font-medium bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {place.extratags.brand}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results or initial state */}
      {!isNearbyLoading && nearbyResults.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Select a Category Above
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Search for nearby restaurants, fuel stations, hospitals, ATMs, hotels, or cafes around the map center.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
