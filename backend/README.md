# Route-X Backend API

Production-ready backend for **Route-X**, a Google Maps-style web navigation and routing application. Built with Node.js, TypeScript, Express.js, PostgreSQL, Prisma ORM, JWT authentication, and external geospatial integrations.

---

## Architecture Overview

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema (PostgreSQL)
│   └── seed.ts              # Database seeder (Demo account & seed data)
├── src/
│   ├── config/              # Environment & Database configuration
│   │   ├── env.ts           # Type-safe Zod environment validation
│   │   └── database.ts      # Prisma client singleton
│   ├── controllers/         # Thin HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── places.controller.ts
│   │   ├── routes.controller.ts
│   │   ├── savedPlaces.controller.ts
│   │   ├── history.controller.ts
│   │   └── favorites.controller.ts
│   ├── services/            # Core business logic layer
│   │   ├── auth.service.ts
│   │   ├── places.service.ts
│   │   ├── routing.service.ts
│   │   ├── weather.service.ts
│   │   ├── elevation.service.ts
│   │   ├── savedPlaces.service.ts
│   │   ├── history.service.ts
│   │   └── favorites.service.ts
│   ├── integrations/maps/   # Geospatial provider proxies
│   │   ├── nominatim.provider.ts # Geocoding & Reverse geocoding
│   │   ├── osrm.provider.ts      # Multi-mode routing & turn maneuvers
│   │   └── overpass.provider.ts  # POI search around coordinates
│   ├── middleware/          # Security, validation, logging & rate-limiting
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── error.middleware.ts
│   ├── validators/          # Zod schema validators
│   ├── docs/                # OpenAPI / Swagger 3.0 specifications
│   │   └── swagger.ts
│   ├── types/               # TypeScript interfaces & types
│   ├── utils/               # Logger (Pino), Password/JWT, ApiResponse
│   ├── app.ts               # Express application pipeline
│   └── server.ts            # HTTP server entrypoint
├── tests/                   # Automated Vitest test suites
│   ├── auth.test.ts
│   ├── places.test.ts
│   ├── routes.test.ts
│   ├── savedPlaces.test.ts
│   └── history.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Tech Stack

| Component | Technology |
|---|---|
| **Runtime & Language** | Node.js (v18+) & TypeScript 5 |
| **Framework** | Express.js 4 |
| **Database & ORM** | PostgreSQL with Prisma ORM 5 |
| **Authentication** | JWT (Dual token: Access Token + Rotating Refresh Token), bcrypt password hashing |
| **Validation** | Zod (Runtime validation for requests and environment variables) |
| **Security** | Helmet, CORS, express-rate-limit |
| **Logging** | Pino & pino-http |
| **API Documentation** | OpenAPI 3.0 + Swagger UI (`/api/docs`) |
| **Testing** | Vitest + Supertest |

---

## Quick Start

### 1. Prerequisites
- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher (or cloud PostgreSQL instance such as Supabase, Neon, AWS RDS)

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` to configure your settings:
```env
# Application
NODE_ENV=development
PORT=5000
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/routex?schema=public"

# JWT Authentication
JWT_ACCESS_SECRET="your-super-secret-access-token-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Geospatial Provider Endpoints (Free defaults included)
NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"
OSRM_BASE_URL="https://router.project-osrm.org"
OVERPASS_BASE_URL="https://overpass-api.de/api/interpreter"
OPEN_METEO_BASE_URL="https://api.open-meteo.com/v1"
OPEN_ELEVATION_BASE_URL="https://api.open-meteo.com/v1"
```

### 4. Database Setup & Seeding
Push the schema to PostgreSQL and seed initial demo data:
```bash
# Push schema to database
npx prisma db push

# Seed demo account and test data
npm run seed
```

#### Demo User Credentials:
- **Email**: `demo@routex.app`
- **Password**: `RouteX@2026`

### 5. Running the Application
```bash
# Development mode (Hot-reload with ts-node-dev)
npm run dev

# Production build & run
npm run build
npm start
```

Backend will be active at `http://localhost:5000`.

---

## Interactive API Documentation

Interactive Swagger documentation is available out of the box:
- **URL**: `http://localhost:5000/api/docs`
- **JSON Spec**: `http://localhost:5000/api/docs/spec`

---

## API Reference

All successful responses follow the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional status message"
}
```

Error responses follow:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description",
    "details": [ ... ]
  }
}
```

### 1. System Health
- `GET /api/health` - Health check status, version and uptime

### 2. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/refresh` | Rotate and issue a new access token | No |
| `POST` | `/api/auth/logout` | Revoke refresh token and logout | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |

### 3. Geospatial & Places Proxy (`/api/places`)
| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/places/search` | `q` (string), `limit` (number) | Search places worldwide with geocoding |
| `GET` | `/api/places/reverse-geocode` | `lat` (float), `lng` (float) | Reverse geocode coordinates to location |
| `GET` | `/api/places/details/:placeId` | - | Fetch detailed place attributes |
| `GET` | `/api/places/nearby` | `lat`, `lng`, `category`, `radius` | POI search around coordinates |

### 4. Routing, Navigation, Weather & Elevation (`/api/routes`, `/api/weather`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/routes` | Calculate route between origin, destination, and waypoints with turn-by-turn steps & geometry |
| `GET` | `/api/routes/elevation` | Elevation profile sampled along route coordinates |
| `GET` | `/api/weather` | Live meteorological conditions at destination coordinates |

#### Route Calculation Request Body Example:
```json
{
  "origin": { "lat": 28.6139, "lng": 77.2090 },
  "destination": { "lat": 28.5355, "lng": 77.3910 },
  "waypoints": [],
  "mode": "driving"
}
```

### 5. Saved Places (`/api/places/saved`)
*Requires Bearer Token*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/places/saved` | List user's saved places |
| `POST` | `/api/places/saved` | Save a new place |
| `PUT` | `/api/places/saved/:id` | Update label or category |
| `DELETE` | `/api/places/saved/:id` | Delete a saved place |
| `POST` | `/api/places/saved/sync` | Bulk sync local places from guest session |

### 6. Search History (`/api/search/history`)
*Requires Bearer Token*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search/history` | List recent searches (max 20) |
| `POST` | `/api/search/history` | Record a search event |
| `DELETE` | `/api/search/history/:id` | Remove a history entry |
| `DELETE` | `/api/search/history` | Clear entire search history |

### 7. Favorite Routes (`/api/routes/favorites`)
*Requires Bearer Token*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/routes/favorites` | List favorite routes |
| `POST` | `/api/routes/favorites` | Save a route |
| `DELETE` | `/api/routes/favorites/:id` | Delete a saved favorite route |

---

## Testing

Comprehensive test suites cover authentication, input validation, geocoding proxies, routing calculations, and scoped user data management.

```bash
# Run all automated tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## Frontend Integration

The Route-X frontend integrates seamlessly via the environment variable `VITE_API_URL`.

In `d:\Project\RouteX\.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

- When the backend is online, all geocoding, routing, weather, elevation, and cloud syncing flow through the secure backend proxy.
- When guest users navigate the app, saved places and searches are stored locally in `localStorage`.
- When logging in or registering, local guest data is automatically synchronized to the user's cloud account.
- The frontend features automatic graceful fallback to public OSM/OSRM endpoints if the backend is temporarily unreachable.

---

## Production Deployment

### 1. Build
```bash
npm run build
```

### 2. Database Migration in Production
```bash
npx prisma migrate deploy
```

### 3. Process Management
Use PM2 or Docker:
```bash
# Using PM2
pm2 start dist/server.js --name "routex-api" -i max

# Or using Docker
docker build -t routex-backend .
docker run -p 5000:5000 --env-file .env routex-backend
```

### 4. Health Check & Monitoring
Setup your load balancer or container health check to ping:
```
GET /api/health
```
A `200 OK` indicates the server and dependencies are operating normally.
