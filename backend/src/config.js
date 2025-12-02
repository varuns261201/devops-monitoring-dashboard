// Configuration management
// Reads from environment variables with sensible defaults

const config = {
  // Server configuration
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // MongoDB configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/monitoring'
};

// Validate configuration
if (isNaN(config.PORT)) {
  throw new Error('PORT must be a number');
}

module.exports = config;
