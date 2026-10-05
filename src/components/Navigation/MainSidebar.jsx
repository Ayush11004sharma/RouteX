import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { SearchTab } from '../Search/SearchTab';
import { PlaceDetailsPanel } from '../PlaceDetails/PlaceDetailsPanel';
import { DirectionsPanel } from '../Directions/DirectionsPanel';
import { NearbyPanel } from '../Nearby/NearbyPanel';
import { SavedPlacesPanel } from '../SavedPlaces/SavedPlacesPanel';
import { RecentSearchesPanel } from '../RecentSearches/RecentSearchesPanel';
import { SettingsPanel } from './SettingsPanel';
import { AboutPanel } from './AboutPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const MainSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { activeTab, selectedPlace, isMobileDrawerOpen, setIsMobileDrawerOpen } = useAppStore();

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'place':
        return <PlaceDetailsPanel />;
      case 'directions':
        return <DirectionsPanel />;
      case 'nearby':
        return <NearbyPanel />;
      case 'saved':
        return <SavedPlacesPanel />;
      case 'recent':
        return <RecentSearchesPanel />;
      case 'settings':
        return <SettingsPanel />;
      case 'about':
        return <AboutPanel />;
      case 'search':
      default:
        return selectedPlace ? <PlaceDetailsPanel /> : <SearchTab />;
    }
  };

  return (
    <>
      {/* Desktop Sidebar Panel */}
      <div
        className={`hidden md:flex relative flex-col h-full bg-white dark:bg-slate-900 shadow-panel transition-all duration-300 z-20 ${
          isCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-[400px] lg:w-[430px]'
        }`}
      >
        {renderActiveContent()}

        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-r-xl shadow-md flex items-center justify-center text-slate-500 hover:text-blue-600 dark:text-slate-400 z-30 transition cursor-pointer"
          title={isCollapsed ? 'Expand Panel' : 'Collapse Panel'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Expand button if desktop panel is collapsed */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex absolute left-20 top-4 bg-white dark:bg-slate-900 px-3.5 py-2.5 rounded-2xl shadow-float border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-blue-600 z-30 items-center gap-2 transition"
        >
          <ChevronRight className="w-4 h-4 text-blue-600" />
          <span>Open Panel</span>
        </button>
      )}

      {/* Mobile Bottom Sheet / Drawer */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-40 bg-white dark:bg-slate-900 rounded-t-3xl shadow-float border-t border-slate-200 dark:border-slate-800 transition-transform duration-300 max-h-[85vh] flex flex-col ${
          isMobileDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
        }`}
      >
        {/* Mobile Pull Handle */}
        <div
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer select-none"
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderActiveContent()}
        </div>
      </div>
    </>
  );
};
