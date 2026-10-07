import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';

describe('Saved Places Endpoints', () => {
  const user = {
    name: 'Saved Places Tester',
    email: `places_test_${Date.now()}@routex.test`,
    password: 'Password@123',
  };

  let token = '';
  let savedPlaceId = '';

  beforeAll(async () => {
    const regRes = await request(app).post('/api/auth/register').send(user);
    token = regRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: user.email } });
  });

  it('GET /api/places/saved - should reject unauthorized user with 401', async () => {
    const res = await request(app).get('/api/places/saved');
    expect(res.status).toBe(401);
  });

  it('POST /api/places/saved - should save a new place for authenticated user', async () => {
    const res = await request(app)
      .post('/api/places/saved')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Taj Mahal',
        address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh',
        latitude: 27.1751,
        longitude: 78.0421,
        category: 'favorite',
        customLabel: 'Must Visit Wonder',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('Taj Mahal');
    savedPlaceId = res.body.data.id;
  });

  it('GET /api/places/saved - should list user saved places', async () => {
    const res = await request(app)
      .get('/api/places/saved')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('PUT /api/places/saved/:id - should update saved place label', async () => {
    const res = await request(app)
      .put(`/api/places/saved/${savedPlaceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        customLabel: 'Updated Wonder Label',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.customLabel).toBe('Updated Wonder Label');
  });

  it('DELETE /api/places/saved/:id - should delete saved place', async () => {
    const res = await request(app)
      .delete(`/api/places/saved/${savedPlaceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
