import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Route Calculation & Navigation Endpoints', () => {
  it('POST /api/routes - should calculate valid route between two coordinates', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({
        origin: { lat: 28.6139, lng: 77.209 },
        destination: { lat: 28.6315, lng: 77.2167 },
        mode: 'driving',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.route).toBeDefined();
    expect(res.body.data.route.distance).toBeGreaterThan(0);
    expect(res.body.data.route.duration).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.route.geometry)).toBe(true);
    expect(Array.isArray(res.body.data.route.steps)).toBe(true);
  });

  it('POST /api/routes - should reject invalid coordinates with 422', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({
        origin: { lat: 120, lng: 77.209 },
        destination: { lat: 28.6315, lng: 77.2167 },
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/routes - should reject unsupported travel mode with 422', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({
        origin: { lat: 28.6139, lng: 77.209 },
        destination: { lat: 28.6315, lng: 77.2167 },
        mode: 'flying_car',
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/weather - should return live destination weather', async () => {
    const res = await request(app).get('/api/weather?lat=28.6139&lng=77.2090');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.data) {
      expect(res.body.data.temperature).toBeDefined();
    }
  });
});
