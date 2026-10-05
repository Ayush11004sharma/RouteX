import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useAppStore } from '../../stores/useAppStore';
import {
  createClickedPointIcon,
  createPlaceMarkerIcon,
  createPoiMarkerIcon,
} from './mapIcons';
import { formatCoordinates } from '../../utils/formatters';
import { Navigation, MapPin, BookmarkPlus, ArrowRight, X } from 'lucide-react';

export const PlacesMarkers = () => {
  const {
    selectedPlace,
    setSelectedPlace,
    searchResults,
    nearbyResults,
    activeNearbyCategory,
    clickedLocation,
    clearClickedLocation,
    setFromPlace,
    setToPlace,
    savePlace,
    currentRoute,
  } = useAppStore();

  return (
    <>
      {selectedPlace && !currentRoute && (
        <Marker
          position={[selectedPlace.lat, selectedPlace.lng]}
          icon={createPlaceMarkerIcon(true, selectedPlace.name)}
          eventHandlers={{
            click: () => setSelectedPlace(selectedPlace, false),
          }}
        >
          <Popup>
            <div className="p-1 min-w-[200px]">
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedPlace.name}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                {selectedPlace.displayName}
              </p>
              <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    setToPlace(selectedPlace);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Directions
                </button>
                <button
                  onClick={() => savePlace(selectedPlace)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded transition"
                  title="Save Place"
                >
                  <BookmarkPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {!selectedPlace &&
        !currentRoute &&
        searchResults.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createPlaceMarkerIcon(false)}
            eventHandlers={{
              click: () => setSelectedPlace(place),
            }}
          >
            <Popup>
              <div className="p-1 min-w-[180px]">
                <div className="text-xs font-semibold text-slate-900">
                  {place.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {place.displayName}
                </div>
                <button
                  onClick={() => setSelectedPlace(place)}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

      {nearbyResults.map((poi) => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng]}
          icon={createPoiMarkerIcon(activeNearbyCategory || 'poi')}
          eventHandlers={{
            click: () => setSelectedPlace(poi),
          }}
        >
          <Popup>
            <div className="p-1 min-w-[190px]">
              <div className="text-xs font-bold text-slate-900">{poi.name}</div>
              {poi.address?.road && (
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {poi.address.road}
                </div>
              )}
              {poi.extratags?.cuisine && (
                <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 inline-block mt-1 font-medium">
                  {poi.extratags.cuisine.replace(/;/g, ', ')}
                </div>
              )}
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => setSelectedPlace(poi)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Details
                </button>
                <span className="text-slate-300">&bull;</span>
                <button
                  onClick={() => setToPlace(poi)}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Route here
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {clickedLocation && (
        <Marker
          position={[clickedLocation.lat, clickedLocation.lng]}
          icon={createClickedPointIcon()}
        >
          <Popup
            eventHandlers={{
              remove: clearClickedLocation,
            }}
          >
            <div className="p-1 min-w-[210px]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Dropped Pin
                </span>
                <button
                  onClick={clearClickedLocation}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="text-xs font-bold text-slate-900 mt-1">
                {clickedLocation.place?.name || 'Selected Location'}
              </div>

              <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                {clickedLocation.place?.displayName ||
                  formatCoordinates(clickedLocation.lat, clickedLocation.lng)}
              </div>

              <div className="text-[10px] text-slate-400 font-mono mt-1">
                {formatCoordinates(clickedLocation.lat, clickedLocation.lng)}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-100 pt-2">
                <button
                  onClick={() => {
                    const place = clickedLocation.place || {
                      id: `pt_${Date.now()}`,
                      name: `Location (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`,
                      displayName: `Location at ${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)}`,
                      lat: clickedLocation.lat,
                      lng: clickedLocation.lng,
                    };
                    setFromPlace(place);
                    clearClickedLocation();
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] rounded font-medium text-center"
                >
                  From here
                </button>
                <button
                  onClick={() => {
                    const place = clickedLocation.place || {
                      id: `pt_${Date.now()}`,
                      name: `Location (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`,
                      displayName: `Location at ${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)}`,
                      lat: clickedLocation.lat,
                      lng: clickedLocation.lng,
                    };
                    setToPlace(place);
                    clearClickedLocation();
                  }}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] rounded font-medium text-center"
                >
                  To here
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};
