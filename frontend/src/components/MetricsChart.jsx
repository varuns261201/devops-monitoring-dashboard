import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MetricsChart.css';

function MetricsChart({ data }) {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    name: `${index + 1}`,
    CPU: item.cpu_usage,
    Memory: item.memory_usage,
    Latency: item.api_latency / 3 // Scale down latency for better visualization
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">Data Point #{data.name}</p>
          <p style={{ color: '#3b82f6' }}>CPU: {data.CPU.toFixed(1)}%</p>
          <p style={{ color: '#10b981' }}>Memory: {data.Memory.toFixed(1)}%</p>
          <p style={{ color: '#f59e0b' }}>Latency: {(data.Latency * 3).toFixed(0)}ms</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="metrics-chart">
      {data.length === 0 ? (
        <div className="no-data">
          <p>📊 Waiting for data...</p>
          <p className="no-data-hint">Data will appear after the first API call</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              label={{ value: 'Data Points', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis 
              label={{ value: 'Value (%)', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="CPU" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Memory" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Latency" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
              name="Latency (scaled)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MetricsChart;
