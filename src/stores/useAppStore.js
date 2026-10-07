import { create } from 'zustand';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  DEFAULT_USER_SETTINGS,
  STORAGE_KEYS,
} from '../constants';
import { getCurrentLocation } from '../services/location';
import { reverseGeocode } from '../services/geocoding';
import { searchNearby } from '../services/places';
import { getRoute } from '../services/routing';
import { fetchWeather } from '../services/weather';
import { getRouteElevation } from '../services/elevation';
import { voiceService } from '../services/voice';
import { api } from '../services/api';

let simulatorInterval = null;

function loadInitialSavedPlaces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PLACES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadInitialRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadInitialSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw
      ? { ...DEFAULT_USER_SETTINGS, voiceGuidance: true, speechRate: 1.0, ...JSON.parse(raw) }
      : { ...DEFAULT_USER_SETTINGS, voiceGuidance: true, speechRate: 1.0 };
  } catch {
    return { ...DEFAULT_USER_SETTINGS, voiceGuidance: true, speechRate: 1.0 };
  }
}

export const useAppStore = create((set, get) => ({
  mapCenter: DEFAULT_MAP_CENTER,
  mapZoom: DEFAULT_MAP_ZOOM,
  tileLayer: loadInitialSettings().tileLayer || 'osm',
  userLocation: null,
  isLocating: false,
  clickedLocation: null,

  measureMode: false,
  measurePoints: [],

  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,
  selectedPlace: null,

  fromPlace: null,
  waypoints: [],
  toPlace: null,
  travelMode: loadInitialSettings().defaultTravelMode || 'driving',
  currentRoute: null,
  alternativeRoutes: [],
  activeRouteIndex: 0,
  isRoutingLoading: false,
  routingError: null,

  isNavigating: false,
  currentStepIndex: 0,
  isVoiceMuted: false,

  destinationWeather: null,
  isWeatherLoading: false,
  routeElevation: null,
  isElevationLoading: false,
  hoverElevationCoord: null,

  isSimulating: false,
  simulationProgress: 0,
  simulationSpeed: 2,
  simulatorPosition: null,
  simulatorHeading: 0,
  autoFollowSimulator: true,

  importedTrack: null,

  activeNearbyCategory: null,
  nearbyResults: [],
  isNearbyLoading: false,

  savedPlaces: loadInitialSavedPlaces(),
  recentSearches: loadInitialRecentSearches(),
  settings: loadInitialSettings(),

  // Auth & Cloud Sync State
  user: null,
  isAuthenticated: false,
  isAuthLoading: false,
  authError: null,
  authModalOpen: false,
  authModalMode: 'login',

  activeTab: 'search',
  isMobileDrawerOpen: false,

  setMapCenter: (center, zoom) => {
    set((state) => ({
      mapCenter: center,
      mapZoom: zoom !== undefined ? zoom : state.mapZoom,
    }));
  },

  setTileLayer: (layer) => {
    set({ tileLayer: layer });
    get().updateSettings({ tileLayer: layer });
  },

  setSelectedPlace: (place, panTo = true) => {
    set({
      selectedPlace: place,
      activeTab: place ? 'place' : 'search',
      isMobileDrawerOpen: !!place,
    });

    if (place) {
      get().addRecentSearch(place);
      get().loadDestinationWeather(place.lat, place.lng);
      if (panTo) {
        set({
          mapCenter: [place.lat, place.lng],
          mapZoom: 16,
        });
      }
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setSearchError: (searchError) => set({ searchError }),

  setFromPlace: (place) => {
    set({ fromPlace: place });
    if (place && get().toPlace) {
      get().calculateRoute();
    }
  },

  setToPlace: (place) => {
    set({ toPlace: place });
    if (place) {
      get().loadDestinationWeather(place.lat, place.lng);
    }
    if (place && get().fromPlace) {
      get().calculateRoute();
    }
  },

  addWaypoint: (place = null) => {
    set((state) => ({
      waypoints: [...state.waypoints, place],
    }));
  },

  removeWaypoint: (index) => {
    set((state) => {
      const updated = state.waypoints.filter((_, i) => i !== index);
      return { waypoints: updated };
    });
    if (get().fromPlace && get().toPlace) {
      get().calculateRoute();
    }
  },

  updateWaypoint: (index, place) => {
    set((state) => {
      const updated = [...state.waypoints];
      updated[index] = place;
      return { waypoints: updated };
    });
    if (get().fromPlace && get().toPlace) {
      get().calculateRoute();
    }
  },

  reorderWaypoints: (fromIndex, toIndex) => {
    set((state) => {
      const list = [...state.waypoints];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return { waypoints: list };
    });
    if (get().fromPlace && get().toPlace) {
      get().calculateRoute();
    }
  },

  swapFromTo: () => {
    const { fromPlace, toPlace, waypoints } = get();
    const reversedWaypoints = [...waypoints].reverse();
    set({ fromPlace: toPlace, toPlace: fromPlace, waypoints: reversedWaypoints });
    if (fromPlace && toPlace) {
      get().calculateRoute();
    }
  },

  setTravelMode: (mode) => {
    set({ travelMode: mode });
    if (get().fromPlace && get().toPlace) {
      get().calculateRoute();
    }
  },

  calculateRoute: async () => {
    const { fromPlace, toPlace, waypoints, travelMode } = get();
    if (!fromPlace || !toPlace) return;

    const validPoints = [fromPlace, ...waypoints.filter((w) => !!w), toPlace];
    const coordinates = validPoints.map((p) => [p.lat, p.lng]);

    set({
      isRoutingLoading: true,
      routingError: null,
      activeRouteIndex: 0,
      activeTab: 'directions',
      isMobileDrawerOpen: true,
      isElevationLoading: true,
    });

    try {
      const result = await getRoute(coordinates, travelMode);

      set({
        currentRoute: result.route,
        alternativeRoutes: result.alternatives,
        isRoutingLoading: false,
        activeRouteIndex: 0,
      });

      get().loadDestinationWeather(toPlace.lat, toPlace.lng);

      getRouteElevation(result.route.geometry)
        .then((elevationData) => {
          set({ routeElevation: elevationData, isElevationLoading: false });
        })
        .catch(() => {
          set({ routeElevation: null, isElevationLoading: false });
        });
    } catch (err) {
      console.error('Routing failed:', err);
      set({
        currentRoute: null,
        alternativeRoutes: [],
        routeElevation: null,
        routingError: err.message || 'Unable to find route between these locations.',
        isRoutingLoading: false,
        isElevationLoading: false,
      });
    }
  },

  selectAlternativeRoute: (index) => {
    const { currentRoute, alternativeRoutes } = get();
    if (!currentRoute || !alternativeRoutes[index]) return;

    const allRoutes = [currentRoute, ...alternativeRoutes];
    const newMain = allRoutes[index + 1];
    if (!newMain) return;

    const newAlternatives = allRoutes.filter((_, idx) => idx !== index + 1);

    set({
      currentRoute: newMain,
      alternativeRoutes: newAlternatives,
      activeRouteIndex: 0,
      isElevationLoading: true,
    });

    getRouteElevation(newMain.geometry)
      .then((elevationData) => {
        set({ routeElevation: elevationData, isElevationLoading: false });
      })
      .catch(() => {
        set({ routeElevation: null, isElevationLoading: false });
      });
  },

  clearDirections: () => {
    get().stopSimulation();
    set({
      fromPlace: null,
      waypoints: [],
      toPlace: null,
      currentRoute: null,
      alternativeRoutes: [],
      routeElevation: null,
      destinationWeather: null,
      routingError: null,
      isNavigating: false,
      currentStepIndex: 0,
    });
  },

  startNavigation: () => {
    const { currentRoute, currentStepIndex, isVoiceMuted } = get();
    set({ isNavigating: true });

    if (!isVoiceMuted && currentRoute && currentRoute.steps[currentStepIndex]) {
      voiceService.speak(
        `Starting route to ${get().toPlace?.name || 'destination'}. ${currentRoute.steps[currentStepIndex].instruction}`
      );
    }
  },

  stopNavigation: () => {
    voiceService.stop();
    set({ isNavigating: false, currentStepIndex: 0 });
  },

  setCurrentStepIndex: (index) => {
    set({ currentStepIndex: index });
    const { currentRoute, isVoiceMuted, isNavigating } = get();
    if (isNavigating && !isVoiceMuted && currentRoute?.steps[index]) {
      voiceService.speak(currentRoute.steps[index].instruction);
    }
  },

  toggleVoiceMute: () => {
    const nextMuted = !get().isVoiceMuted;
    voiceService.setMuted(nextMuted);
    set({ isVoiceMuted: nextMuted });
  },

  speakCurrentInstruction: () => {
    const { currentRoute, currentStepIndex } = get();
    if (currentRoute?.steps[currentStepIndex]) {
      voiceService.speak(currentRoute.steps[currentStepIndex].instruction);
    }
  },

  loadDestinationWeather: async (lat, lng) => {
    set({ isWeatherLoading: true });
    try {
      const weather = await fetchWeather(lat, lng);
      set({ destinationWeather: weather, isWeatherLoading: false });
    } catch {
      set({ isWeatherLoading: false });
    }
  },

  setHoverElevationCoord: (coord) => {
    set({ hoverElevationCoord: coord });
  },

  // Simulator implementation
  startSimulation: () => {
    const { currentRoute, simulationSpeed, isVoiceMuted } = get();
    if (!currentRoute || currentRoute.geometry.length < 2) return;

    if (simulatorInterval) clearInterval(simulatorInterval);

    set({ isSimulating: true, isNavigating: true });
    if (!isVoiceMuted) {
      voiceService.speak(`Drive simulation started at ${simulationSpeed}x speed.`);
    }

    const geom = currentRoute.geometry;
    let progress = get().simulationProgress;
    if (progress >= 1) progress = 0;

    const totalPoints = geom.length;

    simulatorInterval = setInterval(() => {
      const state = get();
      if (!state.isSimulating) {
        clearInterval(simulatorInterval);
        return;
      }

      const speed = state.simulationSpeed;
      const stepDelta = 0.0015 * speed;
      progress += stepDelta;

      if (progress >= 1) {
        progress = 1;
        set({ isSimulating: false, simulationProgress: 1 });
        clearInterval(simulatorInterval);
        if (!state.isVoiceMuted) {
          voiceService.speak('You have arrived at your destination.');
        }
        return;
      }

      const exactIndex = progress * (totalPoints - 1);
      const idx1 = Math.floor(exactIndex);
      const idx2 = Math.min(totalPoints - 1, idx1 + 1);
      const fraction = exactIndex - idx1;

      const p1 = geom[idx1];
      const p2 = geom[idx2];

      const curLat = p1[0] + (p2[0] - p1[0]) * fraction;
      const curLng = p1[1] + (p2[1] - p1[1]) * fraction;

      const dLng = p2[1] - p1[1];
      const dLat = p2[0] - p1[0];
      const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      set({
        simulationProgress: progress,
        simulatorPosition: [curLat, curLng],
        simulatorHeading: heading,
      });

      if (state.autoFollowSimulator) {
        set({ mapCenter: [curLat, curLng] });
      }

      const approxDist = progress * currentRoute.distance;
      let cumulativeStepDist = 0;
      for (let s = 0; s < currentRoute.steps.length; s++) {
        cumulativeStepDist += currentRoute.steps[s].distance;
        if (cumulativeStepDist >= approxDist && s !== state.currentStepIndex) {
          get().setCurrentStepIndex(s);
          break;
        }
      }
    }, 100);
  },

  pauseSimulation: () => {
    if (simulatorInterval) clearInterval(simulatorInterval);
    set({ isSimulating: false });
  },

  stopSimulation: () => {
    if (simulatorInterval) clearInterval(simulatorInterval);
    voiceService.stop();
    set({
      isSimulating: false,
      simulationProgress: 0,
      simulatorPosition: null,
    });
  },

  setSimulationSpeed: (speed) => {
    set({ simulationSpeed: speed });
    if (get().isSimulating) {
      get().startSimulation();
    }
  },

  setSimulationProgress: (progress) => {
    const { currentRoute } = get();
    if (!currentRoute) return;
    const geom = currentRoute.geometry;
    const exactIndex = progress * (geom.length - 1);
    const idx = Math.round(exactIndex);
    set({
      simulationProgress: progress,
      simulatorPosition: geom[idx] || null,
    });
  },

  toggleAutoFollowSimulator: () => {
    set((state) => ({ autoFollowSimulator: !state.autoFollowSimulator }));
  },

  setImportedTrack: (track) => {
    set({
      importedTrack: track,
      activeTab: 'directions',
      isMobileDrawerOpen: true,
    });
    if (track && track.geometry.length > 0) {
      set({ mapCenter: track.geometry[0], mapZoom: 14 });
    }
  },

  clearImportedTrack: () => {
    set({ importedTrack: null });
  },

  requestUserLocation: async () => {
    set({ isLocating: true });
    try {
      const loc = await getCurrentLocation();
      set({
        userLocation: loc,
        isLocating: false,
        mapCenter: [loc.lat, loc.lng],
        mapZoom: 16,
      });
      return loc;
    } catch (err) {
      set({ isLocating: false });
      alert(err.message || 'Could not access your location.');
      return null;
    }
  },

  setClickedLocation: async (lat, lng) => {
    set({
      clickedLocation: { lat, lng, place: null },
    });

    try {
      const place = await reverseGeocode(lat, lng);
      set({
        clickedLocation: { lat, lng, place: place || null },
      });
    } catch {
      // Keep coordinates
    }
  },

  clearClickedLocation: () => {
    set({ clickedLocation: null });
  },

  toggleMeasureMode: () => {
    set((state) => ({
      measureMode: !state.measureMode,
      measurePoints: [],
    }));
  },

  addMeasurePoint: (point) => {
    set((state) => ({
      measurePoints: [...state.measurePoints, point],
    }));
  },

  clearMeasurePoints: () => {
    set({ measurePoints: [] });
  },

  searchNearbyCategory: async (categoryId) => {
    const { mapCenter } = get();
    const centerLat = mapCenter[0];
    const centerLng = mapCenter[1];

    set({
      activeNearbyCategory: categoryId,
      isNearbyLoading: true,
      activeTab: 'nearby',
      isMobileDrawerOpen: true,
    });

    try {
      const results = await searchNearby(centerLat, centerLng, categoryId, 3500);
      set({
        nearbyResults: results,
        isNearbyLoading: false,
      });
    } catch {
      set({
        nearbyResults: [],
        isNearbyLoading: false,
      });
    }
  },

  clearNearby: () => {
    set({
      activeNearbyCategory: null,
      nearbyResults: [],
      isNearbyLoading: false,
    });
  },

  openAuthModal: (mode = 'login') =>
    set({ authModalOpen: true, authModalMode: mode, authError: null }),

  closeAuthModal: () =>
    set({ authModalOpen: false, authError: null }),

  setAuthModalMode: (mode) =>
    set({ authModalMode: mode, authError: null }),

  checkAuth: async () => {
    const token = localStorage.getItem('routex_access_token');
    if (!token) return;
    set({ isAuthLoading: true });
    try {
      const user = await api.auth.getMe();
      if (user) {
        set({ user, isAuthenticated: true, isAuthLoading: false });
        get().syncWithBackend();
      } else {
        set({ user: null, isAuthenticated: false, isAuthLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isAuthLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const result = await api.auth.login(email, password);
      set({
        user: result.user,
        isAuthenticated: true,
        isAuthLoading: false,
        authModalOpen: false,
      });
      get().syncWithBackend();
      return result;
    } catch (err) {
      set({ isAuthLoading: false, authError: err.message });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const result = await api.auth.register(name, email, password);
      set({
        user: result.user,
        isAuthenticated: true,
        isAuthLoading: false,
        authModalOpen: false,
      });
      get().syncWithBackend();
      return result;
    } catch (err) {
      set({ isAuthLoading: false, authError: err.message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.warn('Logout error:', e);
    }
    set({
      user: null,
      isAuthenticated: false,
      savedPlaces: loadInitialSavedPlaces(),
      recentSearches: loadInitialRecentSearches(),
    });
  },

  syncWithBackend: async () => {
    try {
      // 1. Sync guest saved places up to backend
      const localPlaces = get().savedPlaces;
      if (localPlaces.length > 0) {
        try {
          await api.savedPlaces.sync(localPlaces);
        } catch {
          // ignore sync failure
        }
      }

      // 2. Fetch fresh saved places from backend
      const serverPlaces = await api.savedPlaces.list();
      if (Array.isArray(serverPlaces)) {
        const formatted = serverPlaces.map((sp) => ({
          id: sp.id,
          label: sp.customLabel || sp.name,
          category: sp.category || 'favorite',
          customLabel: sp.customLabel || sp.name,
          place: sp.placeData || {
            id: sp.placeId || sp.id,
            name: sp.name,
            displayName: sp.address || sp.name,
            lat: sp.latitude,
            lng: sp.longitude,
            type: sp.category,
          },
          savedAt: new Date(sp.createdAt).getTime(),
        }));
        set({ savedPlaces: formatted });
        try {
          localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(formatted));
        } catch {}
      }

      // 3. Fetch search history from backend
      const serverHistory = await api.history.list();
      if (Array.isArray(serverHistory)) {
        const formattedHistory = serverHistory.map((item) => ({
          id: item.id,
          place: item.placeData || {
            id: item.placeId || item.id,
            name: item.placeName || item.query,
            displayName: item.address || item.placeName || item.query,
            lat: item.latitude || 0,
            lng: item.longitude || 0,
          },
          timestamp: new Date(item.createdAt).getTime(),
        }));
        set({ recentSearches: formattedHistory });
        try {
          localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(formattedHistory));
        } catch {}
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  },

  savePlace: async (place, label, category = 'favorite') => {
    const tempId = `saved_${Date.now()}`;
    const newSaved = {
      id: tempId,
      label: label || place.name,
      category,
      customLabel: label,
      place,
      savedAt: Date.now(),
    };

    set((state) => {
      const filtered = state.savedPlaces.filter((p) => p.place.id !== place.id);
      const updated = [newSaved, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { savedPlaces: updated };
    });

    if (get().isAuthenticated) {
      try {
        const created = await api.savedPlaces.create({
          placeId: String(place.id || place.osmId || tempId),
          name: label || place.name,
          address: place.displayName || place.address?.formattedAddress || '',
          latitude: place.lat,
          longitude: place.lng,
          category,
          customLabel: label,
          placeData: place,
        });
        if (created?.id) {
          set((state) => {
            const updated = state.savedPlaces.map((p) =>
              p.id === tempId ? { ...p, id: created.id } : p
            );
            try {
              localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
            } catch {}
            return { savedPlaces: updated };
          });
        }
      } catch (e) {
        console.warn('Failed to sync saved place to backend:', e);
      }
    }
  },

  removeSavedPlace: async (id) => {
    set((state) => {
      const updated = state.savedPlaces.filter((p) => p.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_PLACES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { savedPlaces: updated };
    });

    if (get().isAuthenticated) {
      try {
        await api.savedPlaces.delete(id);
      } catch (e) {
        console.warn('Failed to delete saved place on backend:', e);
      }
    }
  },

  addRecentSearch: async (place) => {
    const tempId = `recent_${Date.now()}`;
    const newRecent = {
      id: tempId,
      place,
      timestamp: Date.now(),
    };

    set((state) => {
      const filtered = state.recentSearches.filter((r) => r.place.id !== place.id);
      const updated = [newRecent, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { recentSearches: updated };
    });

    if (get().isAuthenticated) {
      try {
        await api.history.add({
          query: place.name || place.displayName || 'Location',
          placeId: String(place.id || place.osmId || tempId),
          placeName: place.name || 'Location',
          address: place.displayName || '',
          latitude: place.lat,
          longitude: place.lng,
          placeData: place,
        });
      } catch (e) {
        console.warn('Failed to sync search history to backend:', e);
      }
    }
  },

  removeRecentSearch: async (id) => {
    set((state) => {
      const updated = state.recentSearches.filter((r) => r.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return { recentSearches: updated };
    });

    if (get().isAuthenticated) {
      try {
        await api.history.deleteItem(id);
      } catch (e) {
        console.warn('Failed to delete search history item on backend:', e);
      }
    }
  },

  clearRecentSearches: async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    } catch (e) {
      console.error(e);
    }
    set({ recentSearches: [] });

    if (get().isAuthenticated) {
      try {
        await api.history.clear();
      } catch (e) {
        console.warn('Failed to clear search history on backend:', e);
      }
    }
  },

  updateSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
      } catch (e) {
        console.error(e);
      }
      return { settings: newSettings };
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab, isMobileDrawerOpen: true }),
  setIsMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
}));
