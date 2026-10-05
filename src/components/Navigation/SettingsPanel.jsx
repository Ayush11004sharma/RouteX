import React from 'react';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Car,
  Bike,
  Footprints,
  Shield,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const SettingsPanel = () => {
  const {
    settings,
    updateSettings,
    clearRecentSearches,
    savedPlaces,
    recentSearches,
    setActiveTab,
  } = useAppStore();

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all saved places and recent searches?')) {
      clearRecentSearches();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Settings className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Preferences & Map Configuration
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

      <div className="p-4 space-y-6">
        {/* Theme Settings */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Interface Appearance
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor },
            ].map((themeOpt) => {
              const Icon = themeOpt.icon;
              const isSelected = settings.theme === themeOpt.id;

              return (
                <button
                  key={themeOpt.id}
                  onClick={() => {
                    updateSettings({ theme: themeOpt.id });
                    if (themeOpt.id === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else if (themeOpt.id === 'light') {
                      document.documentElement.classList.remove('dark');
                    } else {
                      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.classList.add('dark');
                      } else {
                        document.documentElement.classList.remove('dark');
                      }
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1.5" />
                  <span>{themeOpt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Distance Units */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Distance Units
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'km', label: 'Kilometers (km / m)' },
              { id: 'miles', label: 'Miles (mi / ft)' },
            ].map((unitOpt) => {
              const isSelected = settings.distanceUnit === unitOpt.id;

              return (
                <button
                  key={unitOpt.id}
                  onClick={() => updateSettings({ distanceUnit: unitOpt.id })}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{unitOpt.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Travel Mode */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Default Travel Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'driving', label: 'Driving', icon: Car },
              { id: 'cycling', label: 'Cycling', icon: Bike },
              { id: 'walking', label: 'Walking', icon: Footprints },
            ].map((modeOpt) => {
              const Icon = modeOpt.icon;
              const isSelected = settings.defaultTravelMode === modeOpt.id;

              return (
                <button
                  key={modeOpt.id}
                  onClick={() => updateSettings({ defaultTravelMode: modeOpt.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1.5" />
                  <span>{modeOpt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Privacy & Location History */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Privacy & Permissions
          </label>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Location History (Opt-In)
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableLocationHistory}
                onChange={(e) => updateSettings({ enableLocationHistory: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              RouteX does not store your real-time GPS locations unless explicitly opted-in. All searches and saved places remain solely on your local device.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Stored Data
          </label>
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {savedPlaces.length} Saved Places &bull; {recentSearches.length} Recent Searches
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Saved in your browser&apos;s localStorage
              </div>
            </div>
            <button
              onClick={handleClearAllData}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
