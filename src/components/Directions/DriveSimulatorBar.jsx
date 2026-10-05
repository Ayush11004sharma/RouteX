import React from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Compass,
  Gauge,
  Volume1,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { formatDistance, formatDuration } from '../../utils/formatters';

export const DriveSimulatorBar = () => {
  const {
    isSimulating,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    simulationSpeed,
    setSimulationSpeed,
    simulationProgress,
    setSimulationProgress,
    autoFollowSimulator,
    toggleAutoFollowSimulator,
    isVoiceMuted,
    toggleVoiceMute,
    speakCurrentInstruction,
    currentRoute,
    settings,
  } = useAppStore();

  if (!currentRoute) return null;

  const remainingDist = Math.round((1 - simulationProgress) * currentRoute.distance);
  const remainingTime = Math.round((1 - simulationProgress) * currentRoute.duration);

  return (
    <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-float space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Route Simulation
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <span>{formatDuration(remainingTime)}</span>
          <span className="text-slate-500">&bull;</span>
          <span>{formatDistance(remainingDist, settings.distanceUnit)} left</span>
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max="1"
          step="0.002"
          value={simulationProgress}
          onChange={(e) => setSimulationProgress(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Start</span>
          <span>{Math.round(simulationProgress * 100)}%</span>
          <span>Finish</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {isSimulating ? (
            <button
              onClick={pauseSimulation}
              className="p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition"
              title="Pause Simulation"
            >
              <Pause className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl transition"
              title="Start Simulation"
            >
              <Play className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={stopSimulation}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Reset Simulation"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-slate-800 p-1 rounded-xl gap-1">
          <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {[1, 2, 5, 10].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition ${
                simulationSpeed === spd
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={speakCurrentInstruction}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition"
            title="Read Current Step"
          >
            <Volume1 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleVoiceMute}
            className={`p-2 rounded-xl transition ${
              isVoiceMuted
                ? 'bg-slate-800 text-rose-400'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title={isVoiceMuted ? 'Voice Muted' : 'Voice Enabled'}
          >
            {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleAutoFollowSimulator}
            className={`p-2 rounded-xl transition ${
              autoFollowSimulator
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title={autoFollowSimulator ? 'Auto-center on vehicle' : 'Free camera'}
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
