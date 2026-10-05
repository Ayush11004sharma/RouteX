import React, { useState } from 'react';
import {
  X,
  Navigation,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Clock,
  Compass,
  MapPin,
  Accessibility,
  Building,
  Tag,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { getPlaceTypeIcon } from '../Search/placeTypeIcons';
import { formatCoordinates } from '../../utils/formatters';

export const PlaceDetailsPanel = () => {
  const {
    selectedPlace,
    setSelectedPlace,
    savedPlaces,
    savePlace,
    removeSavedPlace,
    setFromPlace,
    setToPlace,
    setActiveTab,
    searchNearbyCategory,
  } = useAppStore();

  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!selectedPlace) return null;

  const isSaved = savedPlaces.some((p) => p.place.id === selectedPlace.id);
  const existingSave = savedPlaces.find((p) => p.place.id === selectedPlace.id);
  const PlaceIcon = getPlaceTypeIcon(selectedPlace.category, selectedPlace.type);

  const handleToggleSave = () => {
    if (isSaved && existingSave) {
      removeSavedPlace(existingSave.id);
    } else {
      savePlace(selectedPlace);
    }
  };

  const handleCopyAddress = () => {
    const textToCopy = selectedPlace.displayName || `${selectedPlace.name} (${selectedPlace.lat}, ${selectedPlace.lng})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?place=${encodeURIComponent(selectedPlace.name)}&lat=${selectedPlace.lat}&lng=${selectedPlace.lng}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedPlace.name,
          text: `Check out ${selectedPlace.name} on RouteX`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleGetDirections = () => {
    setToPlace(selectedPlace);
    setActiveTab('directions');
  };

  const handleSetStart = () => {
    setFromPlace(selectedPlace);
    setActiveTab('directions');
  };

  const handleSetDest = () => {
    setToPlace(selectedPlace);
    setActiveTab('directions');
  };

  const tags = selectedPlace.extratags || {};
  const addr = selectedPlace.address || {};

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Top Banner / Category header */}
      <div className="relative p-5 pb-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20">
        <button
          onClick={() => setSelectedPlace(null)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close place details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 pr-8">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shrink-0">
            <PlaceIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedPlace.type && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                  {selectedPlace.type.replace(/_/g, ' ')}
                </span>
              )}
              {selectedPlace.category && selectedPlace.category !== selectedPlace.type && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full capitalize">
                  {selectedPlace.category}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1 break-words leading-tight">
              {selectedPlace.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {addr.city || addr.town || addr.state || addr.country || selectedPlace.displayName}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="grid grid-cols-4 gap-2 mt-5">
          <button
            onClick={handleGetDirections}
            className="flex flex-col items-center justify-center p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Navigation className="w-4 h-4 mb-1" />
            Directions
          </button>

          <button
            onClick={handleToggleSave}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-semibold border transition ${
              isSaved
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-600'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4 mb-1 text-amber-500" /> : <Bookmark className="w-4 h-4 mb-1" />}
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition"
          >
            {copiedShare ? <Check className="w-4 h-4 mb-1 text-emerald-600" /> : <Share2 className="w-4 h-4 mb-1" />}
            {copiedShare ? 'Copied!' : 'Share'}
          </button>

          <button
            onClick={() => searchNearbyCategory('restaurants')}
            className="flex flex-col items-center justify-center p-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition"
          >
            <Search className="w-4 h-4 mb-1" />
            Nearby
          </button>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-5 space-y-5">
        {/* Address and Location card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">Full Address</span>
                <span className="text-slate-600 dark:text-slate-400 mt-0.5 block leading-relaxed">
                  {selectedPlace.displayName}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyAddress}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
              title="Copy address"
            >
              {copiedAddress ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Coordinates row */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Coordinates</span>
            </div>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {formatCoordinates(selectedPlace.lat, selectedPlace.lng)}
            </span>
          </div>

          {/* City / State / Country details */}
          {(addr.city || addr.town || addr.state || addr.country || addr.postcode) && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs">
              {addr.city && (
                <div>
                  <span className="text-[11px] text-slate-400 block">City</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{addr.city}</span>
                </div>
              )}
              {addr.state && (
                <div>
                  <span className="text-[11px] text-slate-400 block">State / Region</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{addr.state}</span>
                </div>
              )}
              {addr.postcode && (
                <div>
                  <span className="text-[11px] text-slate-400 block">Postal Code</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{addr.postcode}</span>
                </div>
              )}
              {addr.country && (
                <div>
                  <span className="text-[11px] text-slate-400 block">Country</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{addr.country}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real metadata returned from API (Only displayed if returned by provider) */}
        {(tags.website || tags.phone || tags.opening_hours || tags.cuisine || tags.brand || tags.operator || tags.wheelchair) && (
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Place Information
            </h3>

            {tags.website && (
              <a
                href={tags.website.startsWith('http') ? tags.website : `https://${tags.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span className="truncate">{tags.website}</span>
              </a>
            )}

            {tags.phone && (
              <a
                href={`tel:${tags.phone}`}
                className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 hover:text-blue-600"
              >
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{tags.phone}</span>
              </a>
            )}

            {tags.opening_hours && (
              <div className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium block">Opening Hours</span>
                  <span className="text-slate-500 dark:text-slate-400 whitespace-pre-line text-[11px]">
                    {tags.opening_hours}
                  </span>
                </div>
              </div>
            )}

            {tags.cuisine && (
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <Tag className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="capitalize">{tags.cuisine.replace(/;/g, ', ')}</span>
              </div>
            )}

            {(tags.brand || tags.operator) && (
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Operated by: {tags.brand || tags.operator}</span>
              </div>
            )}

            {tags.wheelchair && (
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <Accessibility className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="capitalize">Wheelchair accessible: {tags.wheelchair}</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Route Points Selection */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleSetStart}
            className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition"
          >
            Set as Starting Point
          </button>
          <button
            onClick={handleSetDest}
            className="py-2.5 px-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-200 dark:border-blue-800 transition"
          >
            Set as Destination
          </button>
        </div>
      </div>
    </div>
  );
};
