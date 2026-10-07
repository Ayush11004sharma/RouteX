import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Places & Geocoding Endpoints', () => {
  it('GET /api/places/search - should return search results for valid place query', async () => {
    const res = await request(app).get('/api/places/search?q=Delhi&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      expect(res.body.data[0].lat).toBeDefined();
      expect(res.body.data[0].lng).toBeDefined();
    }
  });

  it('GET /api/places/search - should reject short query with 422', async () => {
    const res = await request(app).get('/api/places/search?q=a');
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/places/reverse-geocode - should reverse geocode valid coordinates', async () => {
    const res = await request(app).get('/api/places/reverse-geocode?lat=28.6139&lng=77.2090');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data) {
      expect(res.body.data.lat).toBeDefined();
      expect(res.body.data.lng).toBeDefined();
    }
  });

  it('GET /api/places/reverse-geocode - should reject invalid latitude with 422', async () => {
    const res = await request(app).get('/api/places/reverse-geocode?lat=999&lng=77.2090');
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/places/nearby - should accept valid nearby search', async () => {
    const res = await request(app).get('/api/places/nearby?lat=28.6139&lng=77.2090&category=restaurants&radius=2000');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
