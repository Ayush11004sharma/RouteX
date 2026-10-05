import React, { useState } from 'react';
import { useMap } from 'react-leaflet';
import {
  Locate,
  Layers,
  Maximize2,
  Minimize2,
  Ruler,
  Compass,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { MAP_LAYERS } from '../../constants';
import { formatCoordinates } from '../../utils/formatters';

export const MapControls = () => {
  const map = useMap();
  const {
    tileLayer,
    setTileLayer,
    requestUserLocation,
    isLocating,
    mapCenter,
    measureMode,
    toggleMeasureMode,
    clearMeasurePoints,
    measurePoints,
  } = useAppStore();

  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleResetNorth = () => {
    map.setView(mapCenter, map.getZoom(), { animate: true });
  };

  return (
    <div className="absolute right-4 bottom-8 z-[1000] flex flex-col items-end gap-3 select-none pointer-events-none">
      {/* Measure info banner if active */}
      {measureMode && (
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-float border border-rose-200 dark:border-rose-900/40 text-xs flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            Measure Mode: Click points on map
          </span>
          {measurePoints.length > 0 && (
            <button
              onClick={clearMeasurePoints}
              className="text-[11px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded hover:bg-rose-100 font-medium"
            >
              Clear ({measurePoints.length})
            </button>
          )}
        </div>
      )}

      {/* Layer selector popover */}
      {showLayerMenu && (
        <div className="pointer-events-auto bg-white dark:bg-slate-900 rounded-2xl shadow-float p-3 border border-slate-200 dark:border-slate-800 w-56 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
            Map Style
          </div>
          {Object.keys(MAP_LAYERS).map((key) => {
            const layer = MAP_LAYERS[key];
            const isSelected = tileLayer === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setTileLayer(key);
                  setShowLayerMenu(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{layer.name}</span>
                {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Main control action buttons group */}
      <div className="pointer-events-auto flex flex-col gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-float border border-slate-200/80 dark:border-slate-800/80">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          aria-label="Map style layers"
          className={`p-2.5 rounded-xl transition ${
            showLayerMenu
              ? 'bg-blue-600 text-white'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Map Layers"
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={() => requestUserLocation()}
          disabled={isLocating}
          aria-label="Find my location"
          className={`p-2.5 rounded-xl transition ${
            isLocating
              ? 'bg-blue-50 text-blue-600 animate-spin'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Your Location"
        >
          <Locate className={`w-5 h-5 ${isLocating ? 'animate-pulse text-blue-600' : ''}`} />
        </button>

        <button
          onClick={toggleMeasureMode}
          aria-label="Measure distance"
          className={`p-2.5 rounded-xl transition ${
            measureMode
              ? 'bg-rose-500 text-white'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Measure distance"
        >
          <Ruler className="w-5 h-5" />
        </button>

        <button
          onClick={handleResetNorth}
          aria-label="Recenter view"
          className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Recenter"
        >
          <Compass className="w-5 h-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
          className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      <div className="pointer-events-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex items-center gap-1.5">
        <span>{formatCoordinates(mapCenter[0], mapCenter[1])}</span>
      </div>
    </div>
  );
};
