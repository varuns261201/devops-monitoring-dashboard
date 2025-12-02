const mongoose = require('mongoose');
const config = require('./config');

// Metric Schema
const metricSchema = new mongoose.Schema({
  cpu_usage: {
    type: Number,
    required: true
  },
  memory_usage: {
    type: Number,
    required: true
  },
  api_latency: {
    type: Number,
    required: true
  },
  request_count: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true // Index for faster sorting/querying
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Create Model
const Metric = mongoose.model('Metric', metricSchema);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Don't exit process - allow app to run without DB in development
    console.warn('⚠️  Running without database persistence');
  }
};

// Graceful disconnect
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  Metric
};
