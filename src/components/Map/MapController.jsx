import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore } from '../../stores/useAppStore';

export function MapEventHandler() {
  const { measureMode, addMeasurePoint, setClickedLocation, setMapCenter } = useAppStore();

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (measureMode) {
        addMeasurePoint([lat, lng]);
      } else {
        setClickedLocation(lat, lng);
      }
    },
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      setMapCenter([center.lat, center.lng], map.getZoom());
    },
  });

  return null;
}

export function MapController() {
  const map = useMap();
  const { currentRoute, selectedPlace, nearbyResults, importedTrack } = useAppStore();

  useEffect(() => {
    if (currentRoute && currentRoute.geometry.length > 1) {
      const bounds = L.latLngBounds(currentRoute.geometry.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
      });
    }
  }, [currentRoute, map]);

  useEffect(() => {
    if (selectedPlace) {
      if (selectedPlace.boundingBox) {
        const [south, north, west, east] = selectedPlace.boundingBox;
        const bounds = L.latLngBounds([south, west], [north, east]);
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 17,
          animate: true,
        });
      } else {
        map.setView([selectedPlace.lat, selectedPlace.lng], 16, { animate: true });
      }
    }
  }, [selectedPlace, map]);

  useEffect(() => {
    if (importedTrack && importedTrack.geometry.length > 1) {
      const bounds = L.latLngBounds(importedTrack.geometry.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 16,
        animate: true,
      });
    }
  }, [importedTrack, map]);

  useEffect(() => {
    if (nearbyResults.length > 1 && !selectedPlace && !currentRoute) {
      const bounds = L.latLngBounds(nearbyResults.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [nearbyResults, selectedPlace, currentRoute, map]);

  return null;
}
