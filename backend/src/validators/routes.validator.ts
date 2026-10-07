import { z } from 'zod';

const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
  lng: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
});

export const calculateRouteSchema = z.object({
  origin: coordinateSchema,
  destination: coordinateSchema,
  waypoints: z.array(coordinateSchema).optional().default([]),
  mode: z.enum(['driving', 'walking', 'cycling']).default('driving'),
});

export const elevationQuerySchema = z.object({
  coordinates: z.string().min(3, 'Coordinates string is required (format: lat,lng;lat,lng)'),
  samples: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 40)),
});

export const weatherQuerySchema = z.object({
  lat: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= -90 && v <= 90, 'Latitude must be between -90 and 90'),
  lng: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= -180 && v <= 180, 'Longitude must be between -180 and 180'),
});

export const createFavoriteRouteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  originName: z.string().min(1),
  destinationName: z.string().min(1),
  originLat: z.number().min(-90).max(90),
  originLng: z.number().min(-180).max(180),
  destLat: z.number().min(-90).max(90),
  destLng: z.number().min(-180).max(180),
  travelMode: z.enum(['driving', 'walking', 'cycling']).default('driving'),
  distance: z.number().nonnegative(),
  duration: z.number().nonnegative(),
  routeData: z.record(z.any()),
});
