import React from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import { useAppStore } from '../../stores/useAppStore';
import {
  createDestinationMarkerIcon,
  createStartMarkerIcon,
  createWaypointMarkerIcon,
  createSimulatorVehicleIcon,
  createElevationHoverIcon,
} from './mapIcons';
import { formatDistance, formatDuration } from '../../utils/formatters';

export const RouteLayer = () => {
  const {
    currentRoute,
    alternativeRoutes,
    selectAlternativeRoute,
    fromPlace,
    toPlace,
    waypoints,
    settings,
    simulatorPosition,
    simulatorHeading,
    hoverElevationCoord,
    importedTrack,
  } = useAppStore();

  const startCoord = currentRoute?.geometry[0];
  const endCoord = currentRoute?.geometry[currentRoute.geometry.length - 1];

  return (
    <>
      {/* Imported GPS Track (GPX / KML / GeoJSON) */}
      {importedTrack && importedTrack.geometry.length > 1 && (
        <>
          <Polyline
            positions={importedTrack.geometry}
            pathOptions={{
              color: '#8b5cf6',
              weight: 6,
              opacity: 0.9,
              dashArray: '4, 8',
              lineCap: 'round',
            }}
          >
            <Popup>
              <div className="p-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                  Imported Track ({importedTrack.format.toUpperCase()})
                </span>
                <div className="text-sm font-bold text-slate-900">{importedTrack.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Distance: {formatDistance(importedTrack.distanceMeters, settings.distanceUnit)}
                </div>
              </div>
            </Popup>
          </Polyline>

          <Marker position={importedTrack.geometry[0]} icon={createStartMarkerIcon()}>
            <Popup>
              <div className="p-1 text-xs font-bold text-slate-900">
                Track Start: {importedTrack.name}
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Alternative Routes (Behind Main Route) */}
      {alternativeRoutes.map((alt, index) => (
        <Polyline
          key={alt.id}
          positions={alt.geometry}
          pathOptions={{
            color: '#64748b',
            weight: 5,
            opacity: 0.65,
            dashArray: '6, 8',
            lineCap: 'round',
          }}
          eventHandlers={{
            click: () => selectAlternativeRoute(index),
          }}
        >
          <Popup>
            <div className="p-1">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {alt.name}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {formatDuration(alt.duration)} ({formatDistance(alt.distance, settings.distanceUnit)})
              </div>
              <button
                onClick={() => selectAlternativeRoute(index)}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 underline"
              >
                Select this route
              </button>
            </div>
          </Popup>
        </Polyline>
      ))}

      {/* Main Route Casing (Border) */}
      {currentRoute && (
        <>
          <Polyline
            positions={currentRoute.geometry}
            pathOptions={{
              color: '#1d4ed8',
              weight: 8,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />

          {/* Main Route Center Line */}
          <Polyline
            positions={currentRoute.geometry}
            pathOptions={{
              color: '#3b82f6',
              weight: 5,
              opacity: 1,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          >
            <Popup>
              <div className="p-1">
                <div className="text-xs font-semibold text-blue-600">Active Route</div>
                <div className="text-base font-bold text-slate-900">
                  {formatDuration(currentRoute.duration)}
                </div>
                <div className="text-xs text-slate-600">
                  {formatDistance(currentRoute.distance, settings.distanceUnit)} &bull; {currentRoute.name}
                </div>
              </div>
            </Popup>
          </Polyline>
        </>
      )}

      {/* Start Point Marker */}
      {startCoord && (
        <Marker position={startCoord} icon={createStartMarkerIcon()}>
          <Popup>
            <div className="p-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Starting Point
              </span>
              <p className="text-xs font-semibold text-slate-900">
                {fromPlace?.name || 'Start Location'}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Intermediate Waypoint Markers */}
      {waypoints.map((wp, index) => {
        if (!wp) return null;
        return (
          <Marker
            key={`waypoint-marker-${index}`}
            position={[wp.lat, wp.lng]}
            icon={createWaypointMarkerIcon(index)}
          >
            <Popup>
              <div className="p-1">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Stop {index + 1}
                </span>
                <p className="text-xs font-semibold text-slate-900">{wp.name}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1">{wp.displayName}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Destination Point Marker */}
      {endCoord && (
        <Marker position={endCoord} icon={createDestinationMarkerIcon()}>
          <Popup>
            <div className="p-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Destination
              </span>
              <p className="text-xs font-semibold text-slate-900">
                {toPlace?.name || 'Destination Location'}
              </p>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Simulator Vehicle Marker */}
      {simulatorPosition && (
        <Marker
          position={simulatorPosition}
          icon={createSimulatorVehicleIcon(simulatorHeading)}
          zIndexOffset={1000}
        />
      )}

      {/* Elevation Hover Marker */}
      {hoverElevationCoord && (
        <Marker
          position={hoverElevationCoord}
          icon={createElevationHoverIcon()}
          zIndexOffset={999}
        />
      )}
    </>
  );
};
