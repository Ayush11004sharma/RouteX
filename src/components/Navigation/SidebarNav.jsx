import React from 'react';
import {
  Search,
  Navigation,
  Compass,
  Bookmark,
  Clock,
  Settings,
  Info,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const SidebarNav = () => {
  const { activeTab, setActiveTab, savedPlaces, recentSearches, setIsMobileDrawerOpen } = useAppStore();

  const navItems = [
    { id: 'search', label: 'Explore', icon: Search },
    { id: 'directions', label: 'Directions', icon: Navigation },
    { id: 'nearby', label: 'Nearby', icon: Compass },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedPlaces.length > 0 ? savedPlaces.length : null },
    { id: 'recent', label: 'Recent', icon: Clock, badge: recentSearches.length > 0 ? recentSearches.length : null },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsMobileDrawerOpen(true);
  };

  return (
    <aside className="w-16 md:w-18 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 select-none z-30">
      {/* RouteX Brand Logo Pin */}
      <div
        onClick={() => handleSelectTab('search')}
        className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition mb-6"
        title="RouteX Home"
      >
        <MapPin className="w-5 h-5 fill-white/20 stroke-white" />
      </div>

      {/* Navigation items list */}
      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              aria-label={item.label}
              className={`relative flex flex-col items-center justify-center w-full py-2.5 rounded-2xl transition group ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Subtle version indicator */}
      <div className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">
        v1.0
      </div>
    </aside>
  );
};
