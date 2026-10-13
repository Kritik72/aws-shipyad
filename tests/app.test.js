const request = require('supertest');
const createApp = require('../src/app');
const state = require('../src/state');

const app = createApp();

describe('health endpoints', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /ready returns 503 when shutting down', async () => {
    expect((await request(app).get('/ready')).status).toBe(200);
    state.ready = false;
    expect((await request(app).get('/ready')).status).toBe(503);
    state.ready = true;
  });

  test('GET /metrics returns Prometheus text', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('shipyard_http_requests_total');
  });
});

describe('API', () => {
  test('GET /api/info', async () => {
    const res = await request(app).get('/api/info');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('hostname');
  });

  test('GET /api/environments lists three environments', async () => {
    const res = await request(app).get('/api/environments');
    expect(res.body.data.map((e) => e.name)).toEqual(['test', 'stage', 'production']);
  });

  test('GET /api/deployments filters by env', async () => {
    const res = await request(app).get('/api/deployments?env=production');
    expect(res.status).toBe(200);
    expect(res.body.data.every((d) => d.env === 'production')).toBe(true);
  });

  test('GET /api/deployments rejects unknown env', async () => {
    const res = await request(app).get('/api/deployments?env=qa');
    expect(res.status).toBe(400);
  });

  test('POST /api/contact validates input', async () => {
    const res = await request(app).post('/api/contact').send({ name: '', email: 'nope', message: 'short' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields)).toEqual(expect.arrayContaining(['name', 'email', 'message']));
  });

  test('POST /api/contact accepts valid input', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ name: 'Asha', email: 'asha@example.com', topic: 'pipeline', message: 'How does promotion to stage work?' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  test('unknown API route returns JSON 404', async () => {
    const res = await request(app).get('/api/nothing');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not found');
  });
});

describe('pages', () => {
  test.each(['/', '/services', '/dashboard', '/architecture', '/api-docs', '/contact'])('GET %s renders', async (path) => {
    const res = await request(app).get(path);
    expect(res.status).toBe(200);
    expect(res.text).toContain('<html');
  });

  test('unknown page renders 404', async () => {
    const res = await request(app).get('/missing-page');
    expect(res.status).toBe(404);
  });
});
