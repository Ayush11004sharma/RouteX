import {
  Building2,
  Hospital,
  Plane,
  Train,
  GraduationCap,
  Utensils,
  Hotel,
  Fuel,
  Landmark,
  Trees,
  ShoppingBag,
  MapPin,
  Route as RouteIcon,
  Compass,
} from 'lucide-react';

export function getPlaceTypeIcon(category, type) {
  const cat = String(category || '').toLowerCase();
  const t = String(type || '').toLowerCase();

  if (cat === 'aeroway' || t.includes('airport')) return Plane;
  if (cat === 'railway' || t.includes('station') || t.includes('train')) return Train;
  if (t.includes('hospital') || t.includes('clinic') || t.includes('pharmacy')) return Hospital;
  if (t.includes('university') || t.includes('college') || t.includes('school')) return GraduationCap;
  if (cat === 'amenity' && (t === 'restaurant' || t === 'cafe' || t === 'fast_food' || t === 'bar')) return Utensils;
  if (cat === 'tourism' && (t === 'hotel' || t === 'motel' || t === 'guest_house')) return Hotel;
  if (t === 'fuel' || t === 'gas') return Fuel;
  if (t === 'bank' || t === 'atm') return Landmark;
  if (cat === 'leisure' && (t === 'park' || t === 'garden' || t === 'pitch')) return Trees;
  if (cat === 'shop' || t === 'supermarket' || t === 'mall') return ShoppingBag;
  if (cat === 'highway' || t === 'road' || t === 'residential' || t === 'motorway') return RouteIcon;
  if (cat === 'boundary' || cat === 'place' || t === 'city' || t === 'town' || t === 'village') return Building2;
  if (cat === 'tourism' || t === 'attraction' || t === 'museum') return Compass;

  return MapPin;
}
