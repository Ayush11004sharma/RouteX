import { useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { reverseGeocode, searchLocations } from '../services/geocoding';

export function useUrlSync() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    activeTab,
    setActiveTab,
    setFromPlace,
    setToPlace,
    setTravelMode,
    setSelectedPlace,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  } = useAppStore();

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/directions')) {
      setActiveTab('directions');
      const fromParam = searchParams.get('from');
      const toParam = searchParams.get('to');
      const modeParam = searchParams.get('mode');

      if (modeParam && ['driving', 'walking', 'cycling'].includes(modeParam)) {
        setTravelMode(modeParam);
      }

      if (fromParam && toParam) {
        const [fromLat, fromLng] = fromParam.split(',').map(Number);
        const [toLat, toLng] = toParam.split(',').map(Number);

        if (!isNaN(fromLat) && !isNaN(fromLng) && !isNaN(toLat) && !isNaN(toLng)) {
          (async () => {
            const fromP = await reverseGeocode(fromLat, fromLng);
            const toP = await reverseGeocode(toLat, toLng);

            setFromPlace(
              fromP || {
                id: `url_from_${Date.now()}`,
                name: `Origin (${fromLat.toFixed(4)}, ${fromLng.toFixed(4)})`,
                displayName: `Origin at ${fromLat.toFixed(4)}, ${fromLng.toFixed(4)}`,
                lat: fromLat,
                lng: fromLng,
              }
            );

            setToPlace(
              toP || {
                id: `url_to_${Date.now()}`,
                name: `Destination (${toLat.toFixed(4)}, ${toLng.toFixed(4)})`,
                displayName: `Destination at ${toLat.toFixed(4)}, ${toLng.toFixed(4)}`,
                lat: toLat,
                lng: toLng,
              }
            );
          })();
        }
      }
    } else if (path.startsWith('/search')) {
      setActiveTab('search');
      const query = searchParams.get('q');
      if (query) {
        setSearchQuery(query);
        setIsSearching(true);
        searchLocations(query)
          .then((results) => setSearchResults(results))
          .catch(() => {})
          .finally(() => setIsSearching(false));
      }
    } else if (path.startsWith('/saved')) {
      setActiveTab('saved');
    } else if (path.startsWith('/recent')) {
      setActiveTab('recent');
    } else if (path.startsWith('/settings')) {
      setActiveTab('settings');
    } else if (path.startsWith('/about')) {
      setActiveTab('about');
    } else if (searchParams.has('lat') && searchParams.has('lng')) {
      const lat = parseFloat(searchParams.get('lat'));
      const lng = parseFloat(searchParams.get('lng'));
      const name = searchParams.get('place') || 'Shared Location';

      if (!isNaN(lat) && !isNaN(lng)) {
        reverseGeocode(lat, lng).then((place) => {
          setSelectedPlace(
            place || {
              id: `shared_${Date.now()}`,
              name,
              displayName: name,
              lat,
              lng,
            }
          );
        });
      }
    }
  }, []);

  useEffect(() => {
    let targetPath = '/';
    if (activeTab === 'directions') targetPath = '/directions';
    else if (activeTab === 'saved') targetPath = '/saved';
    else if (activeTab === 'recent') targetPath = '/recent';
    else if (activeTab === 'settings') targetPath = '/settings';
    else if (activeTab === 'about') targetPath = '/about';

    if (location.pathname !== targetPath && location.pathname !== '/404') {
      navigate(targetPath, { replace: true });
    }
  }, [activeTab]);
}
