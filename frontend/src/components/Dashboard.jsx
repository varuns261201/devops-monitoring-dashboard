import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import MetricsChart from './MetricsChart';
import { fetchMetrics, fetchMetricsHistory } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch metrics from backend
  const loadMetrics = async () => {
    try {
      const data = await fetchMetrics();
      
      // Update current metrics
      setCurrentMetrics(data);
      
      // Add to history (keep last 20 data points)
      setMetricsHistory(prev => {
        const newHistory = [...prev, data];
        return newHistory.slice(-20); // Keep only last 20
      });
      
      setIsConnected(true);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to connect to backend. Make sure it\'s running on port 8080.');
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  // Load metrics on component mount and every 10 seconds
  useEffect(() => {
    // Load initial history from database
    const loadInitialData = async () => {
      try {
        const history = await fetchMetricsHistory(20);
        if (history.length > 0) {
          setMetricsHistory(history);
          setCurrentMetrics(history[history.length - 1]); // Set most recent as current
          setIsConnected(true);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load initial history:', err);
        setIsLoading(false);
      }
    };

    loadInitialData();
    
    // Then start polling for new metrics
    const interval = setInterval(() => {
      loadMetrics();
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 Monitoring Dashboard</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Connecting to backend...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="error-container">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <p className="error-hint">
            Make sure your backend is running: <code>cd backend && npm run dev</code>
          </p>
          <button onClick={loadMetrics} className="retry-button">
            🔄 Retry Connection
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && !error && currentMetrics && (
        <>
          {/* Metric Cards */}
          <div className="metrics-grid">
            <MetricCard
              title="CPU Usage"
              value={currentMetrics.cpu_usage}
              unit="%"
              icon="🖥️"
              color="#3b82f6"
            />
            <MetricCard
              title="Memory Usage"
              value={currentMetrics.memory_usage}
              unit="%"
              icon="💾"
              color="#10b981"
            />
            <MetricCard
              title="API Latency"
              value={currentMetrics.api_latency}
              unit="ms"
              icon="⚡"
              color="#f59e0b"
            />
            <MetricCard
              title="Total Requests"
              value={currentMetrics.request_count}
              unit="requests"
              icon="📈"
              color="#8b5cf6"
            />
          </div>

          {/* Chart */}
          <div className="chart-container">
            <h2>📉 Real-time Metrics Trend</h2>
            <MetricsChart data={metricsHistory} />
            <p className="chart-info">
              Showing last {metricsHistory.length} data points • Updates every 10 seconds
            </p>
          </div>

          {/* Last Update Info */}
          <div className="footer-info">
            <p>Last updated: {new Date(currentMetrics.timestamp).toLocaleTimeString()}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
