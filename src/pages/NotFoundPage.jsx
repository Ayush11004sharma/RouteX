import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none">
      <div className="text-center max-w-md space-y-4">
        <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <Compass className="w-9 h-9 animate-spin-slow" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
          Error 404 &bull; Coordinates Lost
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          The navigation coordinates you requested do not point to a valid RouteX view. Return to the map to explore worldwide locations.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Home className="w-4 h-4" />
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};
