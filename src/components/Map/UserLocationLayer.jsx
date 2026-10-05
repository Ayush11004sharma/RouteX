import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { createUserLocationIcon } from './mapIcons';
import { formatCoordinates, formatDistance } from '../../utils/formatters';
import { Navigation, Compass } from 'lucide-react';

export const UserLocationLayer = () => {
  const { userLocation, setFromPlace, settings } = useAppStore();

  if (!userLocation) return null;

  const userAsPlace = {
    id: 'user_current_location',
    name: 'Your Location',
    displayName: userLocation.address || 'Current GPS Location',
    lat: userLocation.lat,
    lng: userLocation.lng,
  };

  return (
    <>
      {userLocation.accuracy && userLocation.accuracy > 0 && (
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={userLocation.accuracy}
          pathOptions={{
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.12,
            weight: 1.5,
          }}
        />
      )}

      <Marker
        position={[userLocation.lat, userLocation.lng]}
        icon={createUserLocationIcon(userLocation.heading)}
      >
        <Popup>
          <div className="p-1 min-w-[200px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" /> Your Current Location
            </div>

            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1">
              {userLocation.address || 'Current Position'}
            </p>

            <div className="text-[11px] text-slate-500 mt-0.5">
              {formatCoordinates(userLocation.lat, userLocation.lng)}
            </div>

            {userLocation.accuracy && (
              <div className="text-[10px] text-slate-400 mt-1">
                Accuracy: ±{formatDistance(userLocation.accuracy, settings.distanceUnit)}
              </div>
            )}

            <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setFromPlace(userAsPlace)}
                className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1 transition"
              >
                <Navigation className="w-3 h-3" />
                Directions from here
              </button>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
};
