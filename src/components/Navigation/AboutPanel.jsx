import React from 'react';
import { Info, Compass, ShieldCheck, Cpu, Globe2, ExternalLink, X } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { APP_NAME, APP_TAGLINE } from '../../constants';

export const AboutPanel = () => {
  const { setActiveTab } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
            <Info className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">About RouteX</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Architecture & Open Data</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('search')}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Brand Hero */}
        <div className="text-center p-6 bg-gradient-to-b from-blue-50/70 to-transparent dark:from-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-md flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{APP_NAME}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {APP_TAGLINE} &bull; Production-quality real-world interactive web navigation.
          </p>
        </div>

        {/* Real Data Guarantee */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Real Data Guarantee</span>
          </div>
          <p className="text-xs text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
            RouteX never fabricates mock coordinates, fake reviews, fake business ratings, or simulated distances. Every search, route geometry, turn maneuver, and POI is fetched from real open-world geospatial APIs.
          </p>
        </div>

        {/* Real-World Limitations Disclaimer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-blue-600" /> Geographic Coverage & Service Limits
          </h3>
          <p className="leading-relaxed">
            RouteX leverages OpenStreetMap, Nominatim, OSRM, and Overpass API. While covering the entire globe, community data sources differ in coverage compared to commercial proprietary maps. Opening hours, phone numbers, and websites are displayed only when contributed to OpenStreetMap by local surveyors.
          </p>
        </div>

        {/* Tech Stack Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> Technologies & APIs
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { title: 'React 19 & Vite', desc: 'Modern Web Engine' },
              { title: 'Tailwind CSS', desc: 'Custom Map Navigation UI' },
              { title: 'Leaflet & React-Leaflet', desc: 'Interactive Canvas' },
              { title: 'Nominatim API', desc: 'Worldwide Geocoding' },
              { title: 'OSRM Engine', desc: 'Global Route Optimization' },
              { title: 'Overpass API', desc: 'Real Local POI Querying' },
              { title: 'HTML5 Geolocation', desc: 'Browser GPS Sensor' },
              { title: 'Zustand & LocalStorage', desc: 'State & Offline Saves' },
            ].map((tech) => (
              <div
                key={tech.title}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-800"
              >
                <div className="font-semibold text-slate-900 dark:text-white">{tech.title}</div>
                <div className="text-[11px] text-slate-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* External Links */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <a
            href="https://www.openstreetmap.org/about"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs text-blue-600 hover:underline p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span>Learn about OpenStreetMap Contributors</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://project-osrm.org/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs text-blue-600 hover:underline p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span>OSRM Routing Engine</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
