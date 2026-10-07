import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/database';

describe('Search History Endpoints', () => {
  const user = {
    name: 'History Tester',
    email: `history_test_${Date.now()}@routex.test`,
    password: 'Password@123',
  };

  let token = '';
  let historyId = '';

  beforeAll(async () => {
    const regRes = await request(app).post('/api/auth/register').send(user);
    token = regRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: user.email } });
  });

  it('GET /api/search/history - should reject unauthorized user with 401', async () => {
    const res = await request(app).get('/api/search/history');
    expect(res.status).toBe(401);
  });

  it('POST /api/search/history - should record search in user history', async () => {
    const res = await request(app)
      .post('/api/search/history')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'Red Fort',
        placeName: 'Red Fort',
        address: 'Netaji Subhash Marg, Chandni Chowk, New Delhi',
        latitude: 28.6562,
        longitude: 77.241,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    historyId = res.body.data.id;
  });

  it('GET /api/search/history - should list recent searches for authenticated user', async () => {
    const res = await request(app)
      .get('/api/search/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('DELETE /api/search/history/:id - should delete single search history item', async () => {
    const res = await request(app)
      .delete(`/api/search/history/${historyId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('DELETE /api/search/history - should clear all search history for user', async () => {
    const res = await request(app)
      .delete('/api/search/history')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
