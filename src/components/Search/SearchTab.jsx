import React from 'react';
import {
  Utensils,
  Coffee,
  Hospital,
  Fuel,
  Hotel,
  Compass,
  Home,
  Briefcase,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { SearchBar } from './SearchBar';
import { useAppStore } from '../../stores/useAppStore';
import { getPlaceTypeIcon } from './placeTypeIcons';

export const SearchTab = () => {
  const {
    searchResults,
    searchQuery,
    setSelectedPlace,
    setToPlace,
    setActiveTab,
    savedPlaces,
    searchNearbyCategory,
  } = useAppStore();

  const homePlace = savedPlaces.find((p) => p.category === 'home');
  const workPlace = savedPlaces.find((p) => p.category === 'work');

  const quickPills = [
    { label: 'Restaurants', id: 'restaurants', icon: Utensils, color: 'text-amber-500' },
    { label: 'Cafes', id: 'cafes', icon: Coffee, color: 'text-orange-500' },
    { label: 'Gas / Fuel', id: 'gas', icon: Fuel, color: 'text-blue-500' },
    { label: 'Hospitals', id: 'hospitals', icon: Hospital, color: 'text-rose-500' },
    { label: 'Hotels', id: 'hotels', icon: Hotel, color: 'text-indigo-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Top Search Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <SearchBar />

        {/* Quick Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPills.map((pill) => {
            const Icon = pill.icon;
            return (
              <button
                key={pill.id}
                onClick={() => searchNearbyCategory(pill.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition shrink-0"
              >
                <Icon className={`w-3.5 h-3.5 ${pill.color}`} />
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-5">
        {(homePlace || workPlace) && !searchQuery && (
          <div className="grid grid-cols-2 gap-2">
            {homePlace && (
              <div
                onClick={() => setSelectedPlace(homePlace.place)}
                className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 cursor-pointer hover:bg-blue-100/60 transition flex items-center gap-2.5"
              >
                <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Home</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {homePlace.place.name}
                  </div>
                </div>
              </div>
            )}

            {workPlace && (
              <div
                onClick={() => setSelectedPlace(workPlace.place)}
                className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50 cursor-pointer hover:bg-indigo-100/60 transition flex items-center gap-2.5"
              >
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Work</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {workPlace.place.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results list if active */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Locations Found ({searchResults.length})
            </span>
            <div className="space-y-2">
              {searchResults.map((place) => {
                const PlaceIcon = getPlaceTypeIcon(place.category, place.type);

                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                        <PlaceIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">
                          {place.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {place.displayName}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setToPlace(place);
                        setActiveTab('directions');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/60 rounded-xl transition shrink-0"
                      title="Directions"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feature Highlights when idle */}
        {!searchQuery && searchResults.length === 0 && (
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-2xl border border-blue-200/50 dark:border-blue-900/40">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                <Sparkles className="w-4 h-4" /> Real-World Global Navigation
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Search any address, city, landmark, or point of interest worldwide. Click anywhere on the map to drop pins, calculate turn-by-turn routes, and measure distances.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('directions')}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex flex-col items-center justify-center text-center transition"
              >
                <Navigation className="w-5 h-5 text-blue-600 mb-1" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Plan Route</span>
                <span className="text-[10px] text-slate-400">Driving, cycling, walking</span>
              </button>

              <button
                onClick={() => setActiveTab('nearby')}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 flex flex-col items-center justify-center text-center transition"
              >
                <Compass className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Explore Nearby</span>
                <span className="text-[10px] text-slate-400">Discover local amenities</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
