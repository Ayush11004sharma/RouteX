import React, { useState } from 'react';
import {
  Bookmark,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Tag,
  Trash2,
  Navigation,
  Edit2,
  Check,
  X,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const CATEGORY_ICONS = {
  home: Home,
  work: Briefcase,
  college: GraduationCap,
  favorite: Heart,
  custom: Tag,
};

export const SavedPlacesPanel = () => {
  const {
    savedPlaces,
    removeSavedPlace,
    setSelectedPlace,
    setToPlace,
    setActiveTab,
    savePlace,
  } = useAppStore();

  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editCategory, setEditCategory] = useState('favorite');

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditLabel(item.customLabel || item.label || item.place.name);
    setEditCategory(item.category);
  };

  const saveEdit = (item) => {
    savePlace(item.place, editLabel, editCategory);
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
            <Bookmark className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Saved Places</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {savedPlaces.length} locations saved locally
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('search')}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Places List */}
      {savedPlaces.length > 0 ? (
        <div className="p-4 space-y-3">
          {savedPlaces.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || MapPin;
            const isEditing = editingId === item.id;

            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 transition"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Label name (e.g. My Flat)"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-400 rounded-lg focus:outline-none"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {['home', 'work', 'college', 'favorite', 'custom'].map(
                        (cat) => (
                          <button
                            key={cat}
                            onClick={() => setEditCategory(cat)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${
                              editCategory === cat
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-200 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(item)}
                        className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded-lg font-medium flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => setSelectedPlace(item.place)}
                        className="flex items-start gap-2.5 cursor-pointer min-w-0 flex-1"
                      >
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {item.customLabel || item.label || item.place.name}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            {item.category}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.place.displayName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          title="Edit label"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeSavedPlace(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete saved place"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedPlace(item.place)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View on Map
                      </button>
                      <button
                        onClick={() => {
                          setToPlace(item.place);
                          setActiveTab('directions');
                        }}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        <Navigation className="w-3 h-3" /> Directions
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Saved Places Yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Search for any location and tap &ldquo;Save&rdquo; to add it to your Home, Work, or Favorites list.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
