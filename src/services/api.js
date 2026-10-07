const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'routex_access_token';
const REFRESH_TOKEN_KEY = 'routex_refresh_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearStoredTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error(`Network error connecting to RouteX API: ${netErr.message}`);
  }

  // Handle 401 token refresh if refresh token is available
  if (response.status === 401 && !options._retry && getStoredRefreshToken()) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: getStoredRefreshToken() }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          setStoredTokens(refreshData.data.accessToken, refreshData.data.refreshToken);
          headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
          return request(endpoint, { ...options, headers, _retry: true });
        }
      } else {
        clearStoredTokens();
      }
    } catch {
      clearStoredTokens();
    }
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    // Ignore non-json responses
  }

  if (!response.ok) {
    const errorMsg = json?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.code = json?.error?.code || 'API_ERROR';
    err.status = response.status;
    err.details = json?.error?.details;
    throw err;
  }

  return json?.data !== undefined ? json.data : json;
}

export const api = {
  // Authentication
  auth: {
    async register(name, email, password) {
      const data = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data?.accessToken) {
        setStoredTokens(data.accessToken, data.refreshToken);
      }
      return data;
    },
    async login(email, password) {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.accessToken) {
        setStoredTokens(data.accessToken, data.refreshToken);
      }
      return data;
    },
    async logout() {
      const refreshToken = getStoredRefreshToken();
      try {
        await request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } finally {
        clearStoredTokens();
      }
    },
    async getMe() {
      return request('/auth/me');
    },
  },

  // Places & Geocoding
  places: {
    async search(query, limit = 8, signal) {
      const params = new URLSearchParams({ q: query, limit: String(limit) });
      return request(`/places/search?${params.toString()}`, { signal });
    },
    async reverseGeocode(lat, lng, signal) {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      return request(`/places/reverse-geocode?${params.toString()}`, { signal });
    },
    async getDetails(placeId, signal) {
      return request(`/places/details/${placeId}`, { signal });
    },
    async searchNearby(lat, lng, category, radius = 3500, signal) {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        category,
        radius: String(radius),
      });
      return request(`/places/nearby?${params.toString()}`, { signal });
    },
  },

  // Routing, Elevation & Weather
  routes: {
    async calculate(origin, destination, waypoints = [], mode = 'driving', signal) {
      return request('/routes', {
        method: 'POST',
        body: JSON.stringify({ origin, destination, waypoints, mode }),
        signal,
      });
    },
    async elevation(coordinatesString, samples = 40, signal) {
      const params = new URLSearchParams({
        coordinates: coordinatesString,
        samples: String(samples),
      });
      return request(`/routes/elevation?${params.toString()}`, { signal });
    },
    async weather(lat, lng, signal) {
      const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
      return request(`/weather?${params.toString()}`, { signal });
    },
    // Favorite routes
    async listFavorites() {
      return request('/routes/favorites');
    },
    async addFavorite(routeData) {
      return request('/routes/favorites', {
        method: 'POST',
        body: JSON.stringify(routeData),
      });
    },
    async deleteFavorite(id) {
      return request(`/routes/favorites/${id}`, { method: 'DELETE' });
    },
  },

  // Saved Places
  savedPlaces: {
    async list() {
      return request('/places/saved');
    },
    async create(placeData) {
      return request('/places/saved', {
        method: 'POST',
        body: JSON.stringify(placeData),
      });
    },
    async update(id, updates) {
      return request(`/places/saved/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    async delete(id) {
      return request(`/places/saved/${id}`, { method: 'DELETE' });
    },
    async sync(places) {
      return request('/places/saved/sync', {
        method: 'POST',
        body: JSON.stringify({ places }),
      });
    },
  },

  // Search History
  history: {
    async list() {
      return request('/search/history');
    },
    async add(historyData) {
      return request('/search/history', {
        method: 'POST',
        body: JSON.stringify(historyData),
      });
    },
    async deleteItem(id) {
      return request(`/search/history/${id}`, { method: 'DELETE' });
    },
    async clear() {
      return request('/search/history', { method: 'DELETE' });
    },
  },
};

export default api;
