import { z } from 'zod';

export const searchPlacesSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
  lat: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined)),
  lng: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined)),
  viewbox: z.string().optional(),
});

export const geocodeSchema = z.object({
  address: z.string().min(2, 'Address must be at least 2 characters'),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 5)),
});

export const reverseGeocodeSchema = z.object({
  lat: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= -90 && v <= 90, 'Latitude must be between -90 and 90'),
  lng: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= -180 && v <= 180, 'Longitude must be between -180 and 180'),
});

export const nearbyPlacesSchema = z.object({
  lat: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= -90 && v <= 90, 'Latitude must be between -90 and 90'),
  lng: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= -180 && v <= 180, 'Longitude must be between -180 and 180'),
  category: z.string().min(1, 'Category is required'),
  radius: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 3500))
    .refine((v) => v >= 100 && v <= 50000, 'Radius must be between 100m and 50km'),
});

export const createSavedPlaceSchema = z.object({
  placeId: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(150),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.enum(['home', 'work', 'college', 'favorite', 'custom']).default('favorite'),
  customLabel: z.string().optional(),
  placeData: z.record(z.any()).optional(),
});

export const updateSavedPlaceSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  category: z.enum(['home', 'work', 'college', 'favorite', 'custom']).optional(),
  customLabel: z.string().optional(),
});

export const createSearchHistorySchema = z.object({
  query: z.string().optional(),
  placeId: z.string().optional(),
  placeName: z.string().min(1, 'Place name is required'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  placeData: z.record(z.any()).optional(),
});
