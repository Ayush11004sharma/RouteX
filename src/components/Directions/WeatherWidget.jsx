import React from 'react';
import {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const ICON_MAP = {
  Sun,
  SunMedium,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
};

export const WeatherWidget = () => {
  const { destinationWeather, isWeatherLoading, toPlace } = useAppStore();

  if (isWeatherLoading) {
    return (
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Fetching live destination weather...</span>
      </div>
    );
  }

  if (!destinationWeather) return null;

  const WeatherIcon = ICON_MAP[destinationWeather.iconName] || Sun;

  return (
    <div className="p-3 bg-gradient-to-r from-sky-50 to-blue-50/60 dark:from-slate-800/80 dark:to-blue-950/40 rounded-2xl border border-blue-200/70 dark:border-blue-900/50 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs text-blue-600 dark:text-blue-400 shrink-0">
            <WeatherIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {destinationWeather.temperature}°C
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {destinationWeather.description}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              At destination ({toPlace?.name || 'Destination'})
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>{destinationWeather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
            <span>{destinationWeather.humidity}%</span>
          </div>
        </div>
      </div>

      {destinationWeather.isSevere && (
        <div className="pt-1.5 border-t border-blue-200/50 dark:border-blue-900/50 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Travel Alert: Adverse weather conditions expected along this route.</span>
        </div>
      )}
    </div>
  );
};
