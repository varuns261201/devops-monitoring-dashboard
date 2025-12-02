// In-memory counter for tracking total requests
let requestCounter = 0;

/**
 * Generates a random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {number} Random float
 */
function randomFloat(min, max, decimals = 1) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

/**
 * Generates a random integer between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates mock metrics for monitoring
 * Increments request counter on each call
 * Saves metrics to MongoDB database
 * @returns {Promise<Object>} Metrics object with CPU, memory, latency, and request count
 */
async function generateMetrics() {
  // Increment counter for each metrics request
  requestCounter++;

  // Generate realistic-looking metrics
  const metrics = {
    cpu_usage: randomFloat(20, 90, 1),           // CPU usage: 20-90%
    memory_usage: randomFloat(30, 85, 1),        // Memory usage: 30-85%
    api_latency: randomInt(50, 300),             // API latency: 50-300ms
    request_count: requestCounter,               // Total requests served
    timestamp: new Date().toISOString()          // ISO 8601 timestamp
  };

  // Try to save to MongoDB
  try {
    const { Metric } = require('./database');
    const metricDoc = new Metric(metrics);
    await metricDoc.save();
    console.log(`✅ Metric #${requestCounter} saved to database`);
  } catch (error) {
    console.warn('⚠️  Failed to save metric to DB:', error.message);
    // Continue without DB - return metrics anyway
  }

  return metrics;
}

/**
 * Gets the current request count
 * @returns {number} Current request count
 */
function getRequestCount() {
  return requestCounter;
}

/**
 * Resets the request counter (useful for testing)
 * @returns {void}
 */
function resetRequestCount() {
  requestCounter = 0;
}

module.exports = {
  generateMetrics,
  getRequestCount,
  resetRequestCount
};
