export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'RouteX API Documentation',
    version: '1.0.0',
    description:
      'Production-ready backend API for RouteX: Global place search, multi-stop routing, turn-by-turn guidance, weather, elevation, and authenticated saved places & history.',
    contact: {
      name: 'RouteX Team',
      url: 'https://route-x-beta.vercel.app',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local development server',
    },
    {
      url: '/api',
      description: 'Current host',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your access token generated from /api/auth/login or /api/auth/register',
      },
    },
    schemas: {
      Coordinate: {
        type: 'object',
        required: ['lat', 'lng'],
        properties: {
          lat: { type: 'number', example: 28.6139 },
          lng: { type: 'number', example: 77.209 },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string', example: 'Operation successful' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'BAD_REQUEST' },
              message: { type: 'string', example: 'Detailed error message' },
              details: { type: 'object' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Check API service health',
        responses: {
          200: { description: 'Service is healthy' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Ayush Sharma' },
                  email: { type: 'string', example: 'ayush@example.com' },
                  password: { type: 'string', example: 'SecurePass123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registration successful' },
          409: { description: 'Email already exists' },
          422: { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate and receive JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'demo@routex.app' },
                  password: { type: 'string', example: 'RouteX@2026' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get profile of current authenticated user',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile retrieved' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and issue new access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tokens renewed' },
          401: { description: 'Invalid or revoked refresh token' },
        },
      },
    },
    '/places/search': {
      get: {
        summary: 'Search places worldwide via geocoding service',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', example: 'Delhi' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'viewbox', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of matching places' },
        },
      },
    },
    '/places/reverse-geocode': {
      get: {
        summary: 'Reverse geocode coordinates to place details',
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number', example: 28.6139 } },
          { name: 'lng', in: 'query', required: true, schema: { type: 'number', example: 77.209 } },
        ],
        responses: {
          200: { description: 'Place details for coordinate' },
        },
      },
    },
    '/places/nearby': {
      get: {
        summary: 'Search points of interest around coordinate',
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number', example: 28.6139 } },
          { name: 'lng', in: 'query', required: true, schema: { type: 'number', example: 77.209 } },
          { name: 'category', in: 'query', required: true, schema: { type: 'string', example: 'restaurants' } },
          { name: 'radius', in: 'query', schema: { type: 'integer', default: 3500 } },
        ],
        responses: {
          200: { description: 'List of nearby POIs' },
        },
      },
    },
    '/routes': {
      post: {
        summary: 'Calculate route between origin, destination and optional waypoints',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['origin', 'destination'],
                properties: {
                  origin: { $ref: '#/components/schemas/Coordinate' },
                  destination: { $ref: '#/components/schemas/Coordinate' },
                  waypoints: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Coordinate' },
                  },
                  mode: {
                    type: 'string',
                    enum: ['driving', 'walking', 'cycling'],
                    default: 'driving',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Route calculation result with maneuvers and geometry' },
        },
      },
    },
    '/routes/elevation': {
      get: {
        summary: 'Fetch elevation profile along route coordinates',
        parameters: [
          {
            name: 'coordinates',
            in: 'query',
            required: true,
            description: 'Semicolon-separated lat,lng pairs (e.g. 28.6,77.2;28.7,77.3)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Elevation profile' },
        },
      },
    },
    '/weather': {
      get: {
        summary: 'Get live destination weather report',
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number', example: 28.6139 } },
          { name: 'lng', in: 'query', required: true, schema: { type: 'number', example: 77.209 } },
        ],
        responses: {
          200: { description: 'Weather information' },
        },
      },
    },
    '/places/saved': {
      get: {
        summary: 'List user saved places',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Saved places list' } },
      },
      post: {
        summary: 'Save a location',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'address', 'latitude', 'longitude'],
                properties: {
                  name: { type: 'string', example: 'My Apartment' },
                  address: { type: 'string', example: '123 Main St, New Delhi' },
                  latitude: { type: 'number', example: 28.6139 },
                  longitude: { type: 'number', example: 77.209 },
                  category: { type: 'string', enum: ['home', 'work', 'college', 'favorite', 'custom'] },
                  customLabel: { type: 'string', example: 'Home' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Place saved' } },
      },
    },
    '/search/history': {
      get: {
        summary: 'Retrieve user recent searches',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Recent searches' } },
      },
      post: {
        summary: 'Add search entry to history',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Entry added' } },
      },
      delete: {
        summary: 'Clear user search history',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'History cleared' } },
      },
    },
    '/routes/favorites': {
      get: {
        summary: 'List favorite routes',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Favorite routes list' } },
      },
      post: {
        summary: 'Save a route to favorites',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Route saved' } },
      },
    },
  },
};
