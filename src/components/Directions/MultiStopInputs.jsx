import React from 'react';
import { Plus, ArrowUpDown, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { RouteLocationInput } from './RouteLocationInput';
import { useAppStore } from '../../stores/useAppStore';

export const MultiStopInputs = () => {
  const {
    fromPlace,
    toPlace,
    waypoints,
    setFromPlace,
    setToPlace,
    addWaypoint,
    removeWaypoint,
    updateWaypoint,
    reorderWaypoints,
    swapFromTo,
  } = useAppStore();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <RouteLocationInput
            label="Starting point"
            value={fromPlace}
            onChange={setFromPlace}
            placeholder="Starting point or click map..."
            dotColor="bg-emerald-500"
          />
        </div>
        <button
          onClick={swapFromTo}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-blue-600 transition shadow-xs shrink-0"
          title="Swap Start and Destination"
        >
          <ArrowUpDown className="w-4 h-4" />
        </button>
      </div>

      {waypoints.map((stop, index) => (
        <div key={`stop-${index}`} className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex-1">
            <RouteLocationInput
              label={`Stop ${index + 1}`}
              value={stop}
              onChange={(place) => updateWaypoint(index, place)}
              placeholder={`Stop ${index + 1} (optional)...`}
              dotColor="bg-amber-500"
            />
          </div>

          <div className="flex items-center gap-0.5 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
            <button
              disabled={index === 0}
              onClick={() => reorderWaypoints(index, index - 1)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded"
              title="Move up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={index === waypoints.length - 1}
              onClick={() => reorderWaypoints(index, index + 1)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded"
              title="Move down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => removeWaypoint(index)}
              className="p-1 text-slate-400 hover:text-rose-600 rounded"
              title="Remove stop"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <RouteLocationInput
            label="Destination"
            value={toPlace}
            onChange={setToPlace}
            placeholder="Destination or click map..."
            dotColor="bg-rose-500"
          />
        </div>
      </div>

      <div className="flex justify-start pt-0.5">
        <button
          onClick={() => addWaypoint(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Stop</span>
        </button>
      </div>
    </div>
  );
};
