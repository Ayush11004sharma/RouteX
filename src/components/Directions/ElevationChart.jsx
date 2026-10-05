import React, { useState, useRef } from 'react';
import { Mountain, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { formatDistance } from '../../utils/formatters';

export const ElevationChart = () => {
  const { routeElevation, isElevationLoading, setHoverElevationCoord, settings } = useAppStore();
  const [hoverIndex, setHoverIndex] = useState(null);
  const svgRef = useRef(null);

  if (isElevationLoading) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Calculating route elevation profile...</span>
      </div>
    );
  }

  if (!routeElevation || routeElevation.points.length < 2) return null;

  const points = routeElevation.points;
  const maxElev = routeElevation.maxElevation;
  const minElev = Math.max(0, routeElevation.minElevation - 10);
  const elevRange = Math.max(10, maxElev - minElev);

  const totalDist = points[points.length - 1].distanceMeters;

  const chartWidth = 360;
  const chartHeight = 80;
  const paddingX = 10;
  const paddingY = 8;
  const innerW = chartWidth - paddingX * 2;
  const innerH = chartHeight - paddingY * 2;

  const svgPoints = points.map((p) => {
    const x = paddingX + (p.distanceMeters / (totalDist || 1)) * innerW;
    const y = paddingY + innerH - ((p.elevation - minElev) / elevRange) * innerH;
    return { x, y, point: p };
  });

  const lineD = svgPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`, '');
  const areaD = `${lineD} L ${svgPoints[svgPoints.length - 1].x.toFixed(1)} ${chartHeight - paddingY} L ${svgPoints[0].x.toFixed(1)} ${chartHeight - paddingY} Z`;

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - paddingX) / innerW));
    const targetDist = ratio * totalDist;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((p, idx) => {
      const diff = Math.abs(p.distanceMeters - targetDist);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    setHoverElevationCoord([points[closestIdx].lat, points[closestIdx].lng]);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setHoverElevationCoord(null);
  };

  const hoveredPoint = hoverIndex !== null ? svgPoints[hoverIndex] : null;

  return (
    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Mountain className="w-4 h-4 text-emerald-600" />
          <span>Elevation Profile</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-0.5 text-emerald-600 font-semibold" title="Total Ascent">
            <ArrowUpRight className="w-3.5 h-3.5" /> +{routeElevation.totalAscent} m
          </span>
          <span className="flex items-center gap-0.5 text-rose-500 font-semibold" title="Total Descent">
            <ArrowDownRight className="w-3.5 h-3.5" /> -{routeElevation.totalDescent} m
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-24 overflow-visible cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <path d={areaD} fill="url(#elevationGrad)" />

          <path
            d={lineD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#94a3b8"
            strokeWidth="1"
            strokeOpacity="0.3"
          />

          {hoveredPoint && (
            <>
              <line
                x1={hoveredPoint.x}
                y1={paddingY}
                x2={hoveredPoint.x}
                y2={chartHeight - paddingY}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="3, 3"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r="4.5"
                fill="#059669"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {hoveredPoint && (
          <div
            className="absolute top-0 transform -translate-y-full bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap"
            style={{
              left: `${(hoveredPoint.x / chartWidth) * 100}%`,
              transform: 'translate(-50%, -6px)',
            }}
          >
            {hoveredPoint.point.elevation} m &bull; {formatDistance(hoveredPoint.point.distanceMeters, settings.distanceUnit)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Min: {routeElevation.minElevation} m</span>
        <span className="text-slate-500">Interactive elevation chart</span>
        <span>Max: {routeElevation.maxElevation} m</span>
      </div>
    </div>
  );
};
