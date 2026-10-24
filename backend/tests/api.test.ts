import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('NEXA API Integration Tests', () => {
  let authToken = '';
  let testPlanId = '';
  let testTaskId = '';

  it('GET /api/health should return ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('nexa-api');
  });

  it('GET /api/ai/status should return configuration info', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('model');
    expect(res.body.data).toHaveProperty('isConfigured');
  });

  it('POST /api/auth/login with valid seeded user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@nexa.app',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('demo@nexa.app');

    authToken = res.body.data.accessToken;
  });

  it('GET /api/users/me with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('demo@nexa.app');
    expect(res.body.data.user.fullName).toBeTruthy();
    expect(res.body.data.stats).toHaveProperty('plansCount');
  });

  it('GET /api/users/me without token should return 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/plans creates a new structured plan', async () => {
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Launch NEXA Beta Testing',
        description: 'End-to-end user testing with 10 beta testers',
        category: 'WORK',
        tasks: [
          {
            title: 'Prepare onboarding documentation',
            priority: 'HIGH',
            subtasks: ['Write setup guide', 'Create demo video walkthrough'],
          },
        ],
        budget: {
          totalLimit: 150,
          currency: 'USD',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Launch NEXA Beta Testing');
    expect(res.body.data.tasks.length).toBe(1);

    testPlanId = res.body.data.id;
  });

  it('GET /api/plans returns user plans', async () => {
    const res = await request(app)
      .get('/api/plans')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/tasks creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Review analytics instrumentation',
        priority: 'MEDIUM',
        planId: testPlanId,
        tags: ['Quality', 'Metrics'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    testTaskId = res.body.data.id;
  });

  it('PATCH /api/tasks/:id updates status to DONE', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${testTaskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'DONE' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('DONE');
  });

  it('POST /api/ai/organize generates structured plan', async () => {
    const res = await request(app)
      .post('/api/ai/organize')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        prompt: 'Plan a 3-week study routine for calculus exams',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('tasks');
    expect(Array.isArray(res.body.data.tasks)).toBe(true);
  }, 25000);

  it('DELETE /api/plans/:id deletes the plan', async () => {
    const res = await request(app)
      .delete(`/api/plans/${testPlanId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
