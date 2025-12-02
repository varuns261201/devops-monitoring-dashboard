const { generateMetrics, getRequestCount, resetRequestCount } = require('../src/metrics');

describe('Metrics Generation', () => {
  beforeEach(() => {
    resetRequestCount();
  });

  test('generateMetrics returns an object with all required fields', () => {
    const metrics = generateMetrics();
    
    expect(metrics).toHaveProperty('cpu_usage');
    expect(metrics).toHaveProperty('memory_usage');
    expect(metrics).toHaveProperty('api_latency');
    expect(metrics).toHaveProperty('request_count');
    expect(metrics).toHaveProperty('timestamp');
  });

  test('cpu_usage is within expected range', () => {
    const metrics = generateMetrics();
    expect(metrics.cpu_usage).toBeGreaterThanOrEqual(20);
    expect(metrics.cpu_usage).toBeLessThanOrEqual(90);
  });

  test('memory_usage is within expected range', () => {
    const metrics = generateMetrics();
    expect(metrics.memory_usage).toBeGreaterThanOrEqual(30);
    expect(metrics.memory_usage).toBeLessThanOrEqual(85);
  });

  test('api_latency is within expected range', () => {
    const metrics = generateMetrics();
    expect(metrics.api_latency).toBeGreaterThanOrEqual(50);
    expect(metrics.api_latency).toBeLessThanOrEqual(300);
  });

  test('request_count increments on each call', () => {
    const metrics1 = generateMetrics();
    const metrics2 = generateMetrics();
    const metrics3 = generateMetrics();
    
    expect(metrics1.request_count).toBe(1);
    expect(metrics2.request_count).toBe(2);
    expect(metrics3.request_count).toBe(3);
  });

  test('timestamp is a valid ISO string', () => {
    const metrics = generateMetrics();
    const date = new Date(metrics.timestamp);
    
    expect(date).toBeInstanceOf(Date);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  test('getRequestCount returns current counter', () => {
    generateMetrics();
    generateMetrics();
    
    expect(getRequestCount()).toBe(2);
  });

  test('resetRequestCount resets counter to 0', () => {
    generateMetrics();
    generateMetrics();
    resetRequestCount();
    
    expect(getRequestCount()).toBe(0);
    
    const metrics = generateMetrics();
    expect(metrics.request_count).toBe(1);
  });
});
