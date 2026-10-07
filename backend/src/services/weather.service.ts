import axios from 'axios';
import { WeatherData } from '../types';
import { logger } from '../utils/logger';

const weatherCache = new Map<string, { data: WeatherData; expiry: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 mins

export class WeatherService {
  public async getWeather(lat: number, lng: number): Promise<WeatherData | null> {
    const roundedLat = Number(lat.toFixed(3));
    const roundedLng = Number(lng.toFixed(3));
    const cacheKey = `${roundedLat}_${roundedLng}`;

    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m`;
      const response = await axios.get(url, { timeout: 8000 });

      const curr = response.data?.current;
      if (!curr) return null;

      const wmo = this.interpretWmoCode(curr.weather_code);

      const weather: WeatherData = {
        temperature: Math.round(curr.temperature_2m),
        apparentTemperature: Math.round(curr.apparent_temperature),
        humidity: curr.relative_humidity_2m,
        windSpeed: Math.round(curr.wind_speed_10m),
        weatherCode: curr.weather_code,
        description: wmo.description,
        iconName: wmo.icon,
        isRaining: wmo.isRaining,
        isSevere: wmo.isSevere,
        time: curr.time,
      };

      weatherCache.set(cacheKey, { data: weather, expiry: Date.now() + CACHE_TTL_MS });
      return weather;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Weather service request failed');
      return null;
    }
  }

  private interpretWmoCode(code: number) {
    switch (code) {
      case 0:
        return { description: 'Clear sky', icon: 'Sun', isRaining: false, isSevere: false };
      case 1:
        return { description: 'Mainly clear', icon: 'SunMedium', isRaining: false, isSevere: false };
      case 2:
        return { description: 'Partly cloudy', icon: 'CloudSun', isRaining: false, isSevere: false };
      case 3:
        return { description: 'Overcast', icon: 'Cloud', isRaining: false, isSevere: false };
      case 45:
      case 48:
        return { description: 'Foggy / Hazy', icon: 'CloudFog', isRaining: false, isSevere: false };
      case 51:
      case 53:
      case 55:
        return { description: 'Light drizzle', icon: 'CloudDrizzle', isRaining: true, isSevere: false };
      case 61:
      case 63:
        return { description: 'Moderate rain', icon: 'CloudRain', isRaining: true, isSevere: false };
      case 65:
        return { description: 'Heavy rainfall', icon: 'CloudRainWind', isRaining: true, isSevere: true };
      case 71:
      case 73:
      case 75:
        return { description: 'Snowfall', icon: 'CloudSnow', isRaining: false, isSevere: true };
      case 77:
        return { description: 'Snow grains', icon: 'CloudSnow', isRaining: false, isSevere: false };
      case 80:
      case 81:
      case 82:
        return { description: 'Rain showers', icon: 'CloudRain', isRaining: true, isSevere: false };
      case 85:
      case 86:
        return { description: 'Snow showers', icon: 'CloudSnow', isRaining: false, isSevere: true };
      case 95:
      case 96:
      case 99:
        return { description: 'Thunderstorm', icon: 'CloudLightning', isRaining: true, isSevere: true };
      default:
        return { description: 'Fair weather', icon: 'Sun', isRaining: false, isSevere: false };
    }
  }
}
