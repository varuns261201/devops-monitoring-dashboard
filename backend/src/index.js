const express = require("express");
const cors = require("cors");
const { generateMetrics, getRequestCount } = require("./metrics");
const config = require("./config");
const { connectDB, disconnectDB, Metric } = require("./database");

const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend access
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    service: "Monitoring Backend API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      metrics: "/metrics",
      health: "/health",
      info: "/info",
    },
  });
});

// Main metrics endpoint
app.get("/metrics", async (req, res) => {
  try {
    const metrics = await generateMetrics();
    res.json(metrics);
  } catch (error) {
    console.error("Error generating metrics:", error);
    res.status(500).json({
      error: "Failed to generate metrics",
      message: error.message,
    });
  }
});

// Metrics history endpoint - returns last 20 metrics from DB
app.get("/metrics/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const metrics = await Metric.find()
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(limit)
      .select("-__v -createdAt -updatedAt") // Exclude MongoDB metadata
      .lean(); // Return plain JavaScript objects

    // Reverse to get chronological order (oldest to newest)
    const chronologicalMetrics = metrics.reverse();

    res.json({
      count: chronologicalMetrics.length,
      metrics: chronologicalMetrics,
    });
  } catch (error) {
    console.error("Error fetching metrics history:", error);
    res.status(500).json({
      error: "Failed to fetch metrics history",
      message: error.message,
      metrics: [], // Return empty array if DB fails
    });
  }
});

// Health check endpoint (for Kubernetes probes)
app.get("/health", (req, res) => {
  const uptime = process.uptime();
  res.json({
    status: "healthy",
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    service: "monitoring-backend",
  });
});

// Info endpoint with additional details
app.get("/info", (req, res) => {
  res.json({
    service: "monitoring-backend",
    version: "1.0.0",
    environment: config.NODE_ENV,
    port: config.PORT,
    totalRequests: getRequestCount(),
    uptime: Math.floor(process.uptime()),
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: ["/", "/metrics", "/health", "/info"],
  });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Start server
const PORT = config.PORT;
const server = app.listen(PORT, async () => {
  console.log("========================================");
  console.log("  Monitoring Backend API Started");
  console.log("========================================");
  console.log(`  Environment: ${config.NODE_ENV}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log("========================================");

  // Connect to MongoDB
  await connectDB();

  console.log("  Available endpoints:");
  console.log(`    GET  http://localhost:${PORT}/`);
  console.log(`    GET  http://localhost:${PORT}/metrics`);
  console.log(`    GET  http://localhost:${PORT}/metrics/history`);
  console.log(`    GET  http://localhost:${PORT}/health`);
  console.log(`    GET  http://localhost:${PORT}/info`);
  console.log("========================================");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await disconnectDB();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

module.exports = app;
