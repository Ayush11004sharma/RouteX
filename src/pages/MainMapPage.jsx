import React, { useState } from 'react';
import { SidebarNav } from '../components/Navigation/SidebarNav';
import { MainSidebar } from '../components/Navigation/MainSidebar';
import { MapView } from '../components/Map/MapView';
import { useUrlSync } from '../hooks/useUrlSync';
import { useAppStore } from '../stores/useAppStore';
import { SearchBar } from '../components/Search/SearchBar';

export const MainMapPage = () => {
  useUrlSync();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isMobileDrawerOpen } = useAppStore();

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans">
      {/* Desktop/Tablet Left Rail Navigation */}
      <SidebarNav />

      {/* Main Collapsible Information Sidebar */}
      <MainSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Mobile Top Floating Search Bar (shown when mobile sheet is closed) */}
      {!isMobileDrawerOpen && (
        <div className="md:hidden absolute top-3 inset-x-3 z-30 pointer-events-auto">
          <SearchBar placeholder="Search RouteX..." />
        </div>
      )}

      {/* Dominant Real-World Leaflet Map */}
      <main className="relative flex-1 h-full w-full overflow-hidden">
        <MapView />
      </main>
    </div>
  );
};
