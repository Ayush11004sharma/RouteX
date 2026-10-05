import { reverseGeocode } from './geocoding';

/**
 * Requests the current user position using the standard HTML5 Geolocation API.
 */
export async function getCurrentLocation(
  options = {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 10000,
  }
) {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: pos.timestamp,
        };

        try {
          const place = await reverseGeocode(userLoc.lat, userLoc.lng);
          if (place) {
            userLoc.address = place.name || place.displayName;
          }
        } catch {
          // Non-blocking fallback
        }

        resolve(userLoc);
      },
      (error) => {
        let msg = 'Failed to obtain current location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again.';
            break;
        }
        reject(new Error(msg));
      },
      options
    );
  });
}

/**
 * Continuous geolocation tracking for active navigation.
 * Returns an unwatch cleanup function.
 */
export function watchLocation(
  onUpdate,
  onError,
  options = {
    enableHighAccuracy: true,
    maximumAge: 5000,
  }
) {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported by your browser.'));
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
        timestamp: pos.timestamp,
      });
    },
    (err) => {
      onError(new Error(err.message || 'Tracking error'));
    },
    options
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
