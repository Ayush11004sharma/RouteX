# RouteX — Production-Quality Global Navigation & Maps

**RouteX** is a modern, high-performance, Google-Maps-style web navigation application. Built with React 19, TypeScript, Tailwind CSS, Leaflet, and OpenStreetMap ecosystems, RouteX provides full worldwide geographic search, interactive vector tile basemaps, real OSRM turn-by-turn routing, POI discovery, and GPS location tracking without mocked or fabricated data.

---

## 🌟 Key Features

### 1. Interactive Worldwide Map
- **Seamless Vector & Raster Tiles**: Covers the entire globe with smooth zooming, panning, and multi-touch gestures.
- **Multiple Basemap Styles**:
  - OpenStreetMap (Standard)
  - Carto Voyager (Clean high-contrast street navigation)
  - Dark Matter (Sleek dark navigation mode)
  - Esri World Imagery (High-resolution satellite view)
  - OpenTopoMap (Topographic and terrain contours)
- **Dynamic Bounds Fitting**: Automatically fits camera viewports to routes, places, and POI clusters.
- **Interactive Map Pinning**: Click anywhere on earth to reverse-geocode addresses, read GPS coordinates, set origin/destination, or save.
- **Straight-Line Distance Measurement**: Built-in geodesic ruler tool using the haversine formula with real-time distance readouts.
- **Fullscreen & Controls**: One-tap fullscreen mode, compass reset, and live latitude/longitude readout.

### 2. Worldwide Real-Time Search & Autocomplete
- **Global Place Search**: Search for countries, cities, streets, universities, hospitals, airports, railway stations, restaurants, cafes, hotels, ATMs, and postal addresses worldwide.
- **Smart Autocomplete**:
  - Debounced queries (350ms) to respect public rate limits.
  - Keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).
  - Categorized badges and semantic Lucide icons.
  - Request cancellation using `AbortController`.
  - Zero hardcoded fallback lists — all queries call live geocoding APIs.

### 3. Real Multi-Stop Turn-by-Turn Directions & Routing
- **Multi-Stop & Waypoints**: Add unlimited intermediate stops between origin and destination, with reordering, leg breakdown, and numbered stop pins.
- **Multi-Modal Navigation**:
  - 🚗 Driving (Highways, roads, turn restrictions)
  - 🚲 Cycling (Bike paths and low-speed road networks)
  - 🚶 Walking (Pedestrian paths and footways)
- **Alternative Routes**: Compares fastest route with alternative paths, highlighting distance, duration, and main arterial roads.
- **Turn-by-Turn Directions**:
  - Semantic turn maneuver icons (sharp right, slight left, roundabout exit, U-turn, merge, depart, arrive).
  - Step distance and estimated segment duration.
  - Active step guidance mode with heads-up next maneuver display.
- **Route URL Sharing**: Deep-link any route (`/directions?from=LAT,LNG&to=LAT,LNG&mode=driving`) with one-click copy and Web Share API integration.
- **Export & Import Hub**:
  - Export route as **GPX**, **GeoJSON**, or **KML** (Google Earth).
  - Import external `.gpx`, `.geojson`, or `.kml` tracks via drag-and-drop or file upload to render directly on the map.
  - Print-optimized paper directions layout.

### 4. Spoken Voice Turn-by-Turn Guidance
- Real-time text-to-speech spoken instructions powered by the HTML5 `SpeechSynthesis` API.
- Spoken turn warnings as you navigate, audio mute/unmute toggle, and on-demand instruction replay.

### 5. Live Destination Weather (Open-Meteo Integration)
- Live weather conditions at your destination (temperature, apparent feels-like, wind speed, relative humidity).
- WMO condition detection (Sun, Rain, Fog, Snow, Thunderstorms) and severe weather travel advisories.

### 6. Interactive Route Elevation Profile
- Interactive SVG elevation graph visualizing climbs and descents along the route.
- Live stats: Total ascent (m), total descent (m), peak altitude, and lowest point.
- Interactive crosshair that syncs directly with the map, highlighting the corresponding location along the road.

### 7. Virtual Drive Simulator & Playback
- Smooth virtual navigation playback along the real route polyline.
- Speed controls ($1\times, 2\times, 5\times, 10\times$).
- Animated vehicle pointer with heading orientation, live progress scrubber, auto-follow camera, and automatic step progression.

### 8. Nearby POI Discovery
- **"Search Nearby"**: Discover points of interest around the current map viewport or user location.
- **Categories**: Restaurants, Cafes, Hospitals, Pharmacies, Petrol Stations, ATMs & Banks, Hotels, Supermarkets, Attractions, and Parks.
- **Real POI Data**: Powered by Overpass API and Nominatim with genuine OpenStreetMap metadata (opening hours, contact phone, website, cuisine tags, wheelchair accessibility).

### 9. Browser Geolocation & Privacy
- **HTML5 Geolocation**: Precision GPS tracking with live accuracy radius circle and heading arrow.
- **Privacy-First**: No continuous tracking or telemetry. Location history is strictly opt-in and disabled by default.
- **Local Storage**: Saved places (Home, Work, College, Favorite, Custom) and recent searches are saved entirely inside the user's browser.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 8](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + PostCSS |
| **Mapping Engine** | [Leaflet](https://leafletjs.com/) + [React-Leaflet 5](https://react-leaflet.js.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) |
| **Routing & Navigation** | [React Router DOM 7](https://reactrouter.com/) |
| **Geocoding & Reverse Geocoding** | [Nominatim API](https://nominatim.org/) |
| **Routing Engine** | [OSRM Project](https://project-osrm.org/) |
| **POI Query Engine** | [Overpass API](https://overpass-api.de/) |

---

## 🏛 Architecture

RouteX is structured to completely separate UI components from third-party geospatial services, making it easy to swap map, search, or routing providers (e.g. Mapbox, Google Maps Platform, Stadia Maps, GraphHopper) without rewriting UI code:

```
RouteX/
├── public/                     # Static assets and favicon
├── src/
│   ├── components/
│   │   ├── Directions/         # DirectionsPanel, RouteLocationInput, turnIcons
│   │   ├── Map/                # MapView, RouteLayer, PlacesMarkers, MapControls, MeasureLayer
│   │   ├── Navigation/         # SidebarNav, MainSidebar, SettingsPanel, AboutPanel
│   │   ├── Nearby/             # NearbyPanel, category pills
│   │   ├── PlaceDetails/       # PlaceDetailsPanel (authentic OSM metadata)
│   │   ├── RecentSearches/     # RecentSearchesPanel
│   │   ├── SavedPlaces/        # SavedPlacesPanel (Home, Work, Favorite, Custom)
│   │   ├── Search/             # SearchBar, SearchTab, placeTypeIcons
│   │   └── UI/                 # Reusable UI primitives
│   ├── constants/              # Map tile layers, travel modes, nearby categories, storage keys
│   ├── hooks/                  # useUrlSync for deep-linking and state URL synchronization
│   ├── pages/                  # MainMapPage, NotFoundPage
│   ├── services/
│   │   ├── geocoding.ts        # searchLocations(), reverseGeocode(), request throttle & cache
│   │   ├── location.ts         # getCurrentLocation(), watchLocation()
│   │   ├── places.ts           # searchNearby(), Overpass & Nominatim POI formatters
│   │   └── routing.ts          # getRoute(), step parser, fallback speed recalculation
│   ├── stores/                 # useAppStore (Zustand state store)
│   ├── types/                  # Place, RouteData, UserSettings, TravelMode interfaces
│   ├── utils/                  # formatters (distance/duration/coordinates), gpx export
│   ├── App.tsx                 # Route declarations & theme listener
│   ├── index.css               # Tailwind directives & Leaflet custom styling
│   └── main.tsx                # App entrypoint
├── .env.example                # Provider environment variables template
├── tailwind.config.js          # Tailwind theme configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build setup
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` (Recommended `v20+` or `v24+`)
- npm `v9+`

### Installation

1. Clone or open the repository:
   ```bash
   cd RouteX
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for default open-data providers):
   ```bash
   cp .env.example .env
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

### Production Build

To compile a minified production build:
```bash
npm run build
npm run preview
```

---

## 📡 Geospatial API Services

### 1. Geocoding & Reverse Geocoding (`src/services/geocoding.ts`)
- **Provider**: OpenStreetMap Nominatim
- **Search endpoint**: `https://nominatim.openstreetmap.org/search`
- **Reverse endpoint**: `https://nominatim.openstreetmap.org/reverse`
- **Rate-Limiting & Compliance**:
  - Implements an internal minimum request throttle of 800ms between calls.
  - In-memory session LRU cache to avoid repeated queries for the same terms or coordinates.
  - `AbortController` cancellation prevents outdated in-flight keystroke queries.

### 2. Turn-by-Turn Routing (`src/services/routing.ts`)
- **Provider**: Project-OSRM Public Gateway
- **Endpoint**: `https://router.project-osrm.org/route/v1/{profile}/{coords}`
- **Capabilities**:
  - Full route geometry in GeoJSON format.
  - Detailed turn steps, maneuver types, and street names.
  - Real distance in meters and travel duration in seconds.
  - Alternative route generation when supported by the road network.

### 3. Nearby Points of Interest (`src/services/places.ts`)
- **Primary Provider**: Overpass API (`https://overpass-api.de/api/interpreter`)
- **Fallback Provider**: Nominatim Bounded Search
- **Data Extracted**:
  - OSM tags (`amenity`, `cuisine`, `opening_hours`, `contact:phone`, `website`, `wheelchair`, `brand`).
  - No synthetic reviews or mock ratings are displayed.

---

## 📋 Real-World Limitations & Disclaimers

1. **Open Data vs Proprietary Commercial Data**:
   - RouteX relies on open-source geographic data from OpenStreetMap contributors and public OSRM instances.
   - Commercial business hours, live phone numbers, and websites exist only for venues that have been mapped by OSM community members.
2. **Traffic & Real-Time Incidents**:
   - The default public OSRM instance provides routing based on legal road network graphs and typical profile speeds. Real-time congestion delays require a paid traffic provider (e.g. TomTom, Google Maps Platform, or HERE) via our service abstraction layer.
3. **OSRM Public Gateway Usage**:
   - The public demo server `router.project-osrm.org` is intended for evaluation and development. For high-concurrency production deployments, hosting an internal OSRM Docker instance or subscribing to Mapbox / OpenRouteService is recommended.

---

## 📄 License
Open source under the MIT License. Map data &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
