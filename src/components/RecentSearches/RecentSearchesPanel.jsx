import React from 'react';
import { Clock, Trash2, X, Navigation } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { getPlaceTypeIcon } from '../Search/placeTypeIcons';

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const RecentSearchesPanel = () => {
  const {
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    setSelectedPlace,
    setToPlace,
    setActiveTab,
  } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Searches</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {recentSearches.length} searches stored locally
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {recentSearches.length > 0 && (
            <button
              onClick={clearRecentSearches}
              className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setActiveTab('search')}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* List */}
      {recentSearches.length > 0 ? (
        <div className="p-4 space-y-2">
          {recentSearches.map((item) => {
            const PlaceIcon = getPlaceTypeIcon(item.place.category, item.place.type);
            const timeAgo = formatTimeAgo(item.timestamp);

            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 transition group"
              >
                <div
                  onClick={() => setSelectedPlace(item.place)}
                  className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">
                    <PlaceIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition">
                      {item.place.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.place.displayName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{timeAgo}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      setToPlace(item.place);
                      setActiveTab('directions');
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/60 rounded-lg transition"
                    title="Directions"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeRecentSearch(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Recent Searches
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              When you search for places worldwide, they will be saved here for quick access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
