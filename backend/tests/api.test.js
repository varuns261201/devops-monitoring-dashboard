const request = require('supertest');
const app = require('../src/index');

describe('API Endpoints', () => {
  describe('GET /', () => {
    test('should return service information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('GET /metrics', () => {
    test('should return metrics data', async () => {
      const response = await request(app).get('/metrics');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cpu_usage');
      expect(response.body).toHaveProperty('memory_usage');
      expect(response.body).toHaveProperty('api_latency');
      expect(response.body).toHaveProperty('request_count');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should return valid data types', async () => {
      const response = await request(app).get('/metrics');
      
      expect(typeof response.body.cpu_usage).toBe('number');
      expect(typeof response.body.memory_usage).toBe('number');
      expect(typeof response.body.api_latency).toBe('number');
      expect(typeof response.body.request_count).toBe('number');
      expect(typeof response.body.timestamp).toBe('string');
    });

    test('should have CORS headers', async () => {
      const response = await request(app).get('/metrics');
      
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should have valid uptime', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /info', () => {
    test('should return service information', async () => {
      const response = await request(app).get('/info');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('totalRequests');
      expect(response.body).toHaveProperty('memoryUsage');
    });
  });

  describe('GET /nonexistent', () => {
    test('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/nonexistent');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});
