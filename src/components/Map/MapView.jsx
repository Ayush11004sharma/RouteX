import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { MAP_LAYERS } from '../../constants';
import { MapEventHandler, MapController } from './MapController';
import { RouteLayer } from './RouteLayer';
import { PlacesMarkers } from './PlacesMarkers';
import { UserLocationLayer } from './UserLocationLayer';
import { MeasureLayer } from './MeasureLayer';
import { MapControls } from './MapControls';

export const MapView = () => {
  const { mapCenter, mapZoom, tileLayer } = useAppStore();
  const currentLayer = MAP_LAYERS[tileLayer] || MAP_LAYERS.osm;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          key={tileLayer}
          url={currentLayer.url}
          attribution={currentLayer.attribution}
          maxZoom={currentLayer.maxZoom}
        />

        <MapEventHandler />
        <MapController />

        {/* Dynamic Map Layers */}
        <RouteLayer />
        <PlacesMarkers />
        <UserLocationLayer />
        <MeasureLayer />

        {/* Map Controls */}
        <MapControls />
      </MapContainer>
    </div>
  );
};
