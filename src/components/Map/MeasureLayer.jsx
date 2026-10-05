import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import { useAppStore } from '../../stores/useAppStore';
import { formatDistance } from '../../utils/formatters';

function getHaversineDistance(c1, c2) {
  const R = 6371000;
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLon = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[0] * Math.PI) / 180) *
      Math.cos((c2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const MeasureLayer = () => {
  const { measureMode, measurePoints, settings } = useAppStore();

  if (!measureMode || measurePoints.length === 0) return null;

  let totalDistance = 0;
  const cumulativeDistances = [0];

  for (let i = 1; i < measurePoints.length; i++) {
    const dist = getHaversineDistance(measurePoints[i - 1], measurePoints[i]);
    totalDistance += dist;
    cumulativeDistances.push(totalDistance);
  }

  return (
    <>
      <Polyline
        positions={measurePoints}
        pathOptions={{
          color: '#e11d48',
          weight: 3,
          dashArray: '6, 6',
          opacity: 0.9,
        }}
      />

      {measurePoints.map((point, index) => {
        const isLast = index === measurePoints.length - 1;
        return (
          <CircleMarker
            key={`measure-${index}`}
            center={point}
            radius={isLast ? 7 : 5}
            pathOptions={{
              color: '#ffffff',
              fillColor: isLast ? '#e11d48' : '#be123c',
              fillOpacity: 1,
              weight: 2,
            }}
          >
            {isLast && (
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <div className="font-bold text-xs text-rose-700">
                  Total: {formatDistance(totalDistance, settings.distanceUnit)}
                </div>
              </Tooltip>
            )}
          </CircleMarker>
        );
      })}
    </>
  );
};
