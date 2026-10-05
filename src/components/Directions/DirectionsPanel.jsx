import React, { useState } from 'react';
import {
  Car,
  Footprints,
  Bike,
  X,
  Share2,
  Download,
  Printer,
  Play,
  StopCircle,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  FileCode,
  Upload,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { MultiStopInputs } from './MultiStopInputs';
import { WeatherWidget } from './WeatherWidget';
import { ElevationChart } from './ElevationChart';
import { DriveSimulatorBar } from './DriveSimulatorBar';
import { TrackImportModal } from './TrackImportModal';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { getTurnIcon } from './turnIcons';
import { downloadGpx } from '../../utils/gpx';
import { downloadGeoJson, downloadKml } from '../../services/trackParser';

export const DirectionsPanel = () => {
  const {
    fromPlace,
    toPlace,
    waypoints,
    clearDirections,
    travelMode,
    setTravelMode,
    currentRoute,
    alternativeRoutes,
    selectAlternativeRoute,
    isRoutingLoading,
    routingError,
    settings,
    isNavigating,
    startNavigation,
    stopNavigation,
    currentStepIndex,
    setCurrentStepIndex,
    isVoiceMuted,
    toggleVoiceMute,
    speakCurrentInstruction,
    isSimulating,
    startSimulation,
    setActiveTab,
  } = useAppStore();

  const [copiedLink, setCopiedLink] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleShareRoute = async () => {
    if (!fromPlace || !toPlace) return;
    const url = `${window.location.origin}/directions?from=${fromPlace.lat},${fromPlace.lng}&to=${toPlace.lat},${toPlace.lng}&mode=${travelMode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Route from ${fromPlace.name} to ${toPlace.name}`,
          text: `RouteX Navigation: ${fromPlace.name} to ${toPlace.name}`,
          url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const allRoutes = currentRoute ? [currentRoute, ...alternativeRoutes] : [];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Top Header & Inputs */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        {/* Mode Selector & Top Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTravelMode('driving')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                travelMode === 'driving'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Driving"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive</span>
            </button>
            <button
              onClick={() => setTravelMode('cycling')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                travelMode === 'cycling'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Cycling"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Cycle</span>
            </button>
            <button
              onClick={() => setTravelMode('walking')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                travelMode === 'walking'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Walking"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Walk</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowImportModal(true)}
              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Import GPS Track (GPX / KML / GeoJSON)"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={clearDirections}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Clear all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close Directions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Multi-Stop Inputs */}
        <MultiStopInputs />
      </div>

      {/* Loading state */}
      {isRoutingLoading && (
        <div className="p-8 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Calculating best multi-point route...
          </p>
        </div>
      )}

      {/* Routing Error */}
      {routingError && !isRoutingLoading && (
        <div className="m-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">Routing Unavailable</span>
            <span>{routingError}</span>
          </div>
        </div>
      )}

      {/* Turn-by-turn Navigation Simulation Banner */}
      {isNavigating && currentRoute && currentRoute.steps.length > 0 && (
        <div className="p-4 bg-blue-600 text-white shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-blue-500/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase">
                Active Guidance
              </span>
              <button
                onClick={toggleVoiceMute}
                className="p-1 rounded bg-blue-700 hover:bg-blue-800 text-white transition"
                title={isVoiceMuted ? 'Voice Muted' : 'Voice Enabled'}
              >
                {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-300" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={speakCurrentInstruction}
                className="p-1 rounded bg-blue-700 hover:bg-blue-800 text-white transition"
                title="Hear current instruction"
              >
                <Volume1 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={stopNavigation}
              className="flex items-center gap-1 text-xs bg-blue-700 hover:bg-blue-800 px-2.5 py-1 rounded-lg font-medium transition"
            >
              <StopCircle className="w-3.5 h-3.5" /> Exit
            </button>
          </div>

          {/* Current Active Step Banner */}
          {currentRoute.steps[currentStepIndex] && (
            <div className="pt-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-white text-blue-600 rounded-2xl shadow-sm shrink-0">
                  {React.createElement(
                    getTurnIcon(currentRoute.steps[currentStepIndex].maneuver),
                    { className: 'w-6 h-6' }
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold leading-tight">
                    {currentRoute.steps[currentStepIndex].instruction}
                  </div>
                  <div className="text-xs text-blue-100 mt-1 flex items-center gap-2">
                    <span>
                      In {formatDistance(currentRoute.steps[currentStepIndex].distance, settings.distanceUnit)}
                    </span>
                    {currentRoute.steps[currentStepIndex].duration > 0 && (
                      <>
                        <span>&bull;</span>
                        <span>~{formatDuration(currentRoute.steps[currentStepIndex].duration)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Prev / Next step controller */}
              <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-blue-500/40">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-500/60 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs text-blue-100">
                  Step {currentStepIndex + 1} of {currentRoute.steps.length}
                </span>
                <button
                  disabled={currentStepIndex >= currentRoute.steps.length - 1}
                  onClick={() =>
                    setCurrentStepIndex(Math.min(currentRoute.steps.length - 1, currentStepIndex + 1))
                  }
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-500/60 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Route Content */}
      {currentRoute && !isRoutingLoading && (
        <div className="flex-1 p-4 space-y-4">
          {/* Drive Simulator Bar */}
          <DriveSimulatorBar />

          {/* Route Alternatives Selection Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Suggested Routes ({allRoutes.length})
              </span>
              {waypoints.length > 0 && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                  {waypoints.length} {waypoints.length === 1 ? 'Stop' : 'Stops'}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {allRoutes.map((route, idx) => {
                const isActive = idx === 0;
                return (
                  <div
                    key={route.id}
                    onClick={() => {
                      if (!isActive) selectAlternativeRoute(idx - 1);
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {formatDuration(route.duration)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({formatDistance(route.distance, settings.distanceUnit)})
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                          {route.name}
                        </div>
                      </div>
                      {isActive ? (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Fastest
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-blue-600 hover:underline">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destination Weather Card */}
          <WeatherWidget />

          {/* Elevation Profile Chart */}
          <ElevationChart />

          {/* Multi-Leg Summary Breakdown if multi-stop */}
          {currentRoute.legs && currentRoute.legs.length > 1 && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Journey Leg Breakdown
              </span>
              <div className="space-y-1.5">
                {currentRoute.legs.map((leg, legIdx) => (
                  <div
                    key={`leg-${legIdx}`}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                        {legIdx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Leg {legIdx + 1}
                      </span>
                    </div>
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      {formatDuration(leg.duration)} &bull; {formatDistance(leg.distance, settings.distanceUnit)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons (Start, Simulate, Share, Export) */}
          <div className="grid grid-cols-4 gap-2 pt-1 relative">
            <button
              onClick={() => {
                if (isNavigating) {
                  stopNavigation();
                } else {
                  startNavigation();
                }
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition ${
                isNavigating
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isNavigating ? <StopCircle className="w-4 h-4 mb-1" /> : <Play className="w-4 h-4 mb-1" />}
              {isNavigating ? 'Stop' : 'Start'}
            </button>

            <button
              onClick={() => {
                if (isSimulating) {
                  useAppStore.getState().pauseSimulation();
                } else {
                  startSimulation();
                }
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-semibold transition"
              title="Virtual Drive Simulator"
            >
              <Car className="w-4 h-4 mb-1" />
              {isSimulating ? 'Pause' : 'Simulate'}
            </button>

            <button
              onClick={handleShareRoute}
              className="flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
            >
              {copiedLink ? <Check className="w-4 h-4 mb-1 text-emerald-600" /> : <Share2 className="w-4 h-4 mb-1" />}
              {copiedLink ? 'Copied!' : 'Share'}
            </button>

            {/* Export Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="w-full h-full flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                title="Export Route"
              >
                <Download className="w-4 h-4 mb-1" />
                Export
              </button>

              {/* Export Format Popover */}
              {showExportMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-44 bg-white dark:bg-slate-900 rounded-2xl shadow-float border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Select Format
                  </div>
                  <button
                    onClick={() => {
                      downloadGpx(currentRoute, fromPlace?.name, toPlace?.name);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center justify-between"
                  >
                    <span>GPS Track (.GPX)</span>
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      downloadGeoJson(currentRoute, fromPlace?.name, toPlace?.name);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center justify-between"
                  >
                    <span>GeoJSON (.json)</span>
                    <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                  <button
                    onClick={() => {
                      downloadKml(currentRoute, fromPlace?.name, toPlace?.name);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center justify-between"
                  >
                    <span>Google Earth (.KML)</span>
                    <FileCode className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1" />
                  <button
                    onClick={() => {
                      window.print();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg flex items-center justify-between"
                  >
                    <span>Print Directions</span>
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Turn-by-Turn Step List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Turn-by-Turn Directions ({currentRoute.steps.length} steps)
              </span>
              <button
                onClick={speakCurrentInstruction}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" /> Read
              </button>
            </div>

            <div className="space-y-1">
              {currentRoute.steps.map((step, idx) => {
                const TurnIcon = getTurnIcon(step.maneuver);
                const isCurrent = isNavigating && idx === currentStepIndex;

                return (
                  <div
                    key={step.id}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl transition cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-100/70 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex flex-col items-center pt-0.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <TurnIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-mono">{idx + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {step.instruction}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{formatDistance(step.distance, settings.distanceUnit)}</span>
                        {step.duration > 0 && (
                          <>
                            <span>&bull;</span>
                            <span>{formatDuration(step.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State before choosing locations */}
      {!currentRoute && !isRoutingLoading && !routingError && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
          <Car className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Plan Multi-Stop Navigation
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Add starting point, intermediate stops, and destination. Enjoy voice guidance, weather alerts, elevation profiles, and drive simulation.
            </p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="mt-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-center gap-1.5 hover:bg-blue-100 transition"
          >
            <Upload className="w-3.5 h-3.5" /> Import GPX / KML Track
          </button>
        </div>
      )}

      {/* Track Import Modal */}
      <TrackImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
};
