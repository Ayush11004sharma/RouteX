import { Request } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export type TravelMode = 'driving' | 'walking' | 'cycling';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface PlaceAddress {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  formattedAddress?: string;
}

export interface PlaceExtraTags {
  website?: string;
  phone?: string;
  opening_hours?: string;
  wheelchair?: string;
  cuisine?: string;
  brand?: string;
  operator?: string;
  stars?: string;
  smoking?: string;
  internet_access?: string;
  wikidata?: string;
  wikipedia?: string;
  [key: string]: string | undefined;
}

export interface StandardPlace {
  id: string;
  osmId?: string;
  osmType?: string;
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  category?: string;
  type?: string;
  importance?: number;
  address?: PlaceAddress;
  extratags?: PlaceExtraTags;
  boundingBox?: [number, number, number, number];
}

export interface RouteManeuver {
  type: string;
  modifier?: string;
  location: [number, number];
}

export interface RouteStep {
  id: string;
  instruction: string;
  distance: number;
  duration: number;
  name?: string;
  maneuver: RouteManeuver;
}

export interface RouteLeg {
  distance: number;
  duration: number;
  summary: string;
  steps: RouteStep[];
}

export interface StandardRoute {
  id: string;
  name: string;
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][]; // [lat, lng][]
  summary: string;
  weight?: number;
  legs: RouteLeg[];
  steps: RouteStep[];
  isAlternative: boolean;
}

export interface RouteResult {
  route: StandardRoute;
  alternatives: StandardRoute[];
}

export interface ElevationPoint {
  distanceMeters: number;
  elevation: number;
  lat: number;
  lng: number;
}

export interface RouteElevationProfile {
  points: ElevationPoint[];
  totalAscent: number;
  totalDescent: number;
  maxElevation: number;
  minElevation: number;
}

export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  iconName: string;
  isRaining: boolean;
  isSevere: boolean;
  time: string;
}
