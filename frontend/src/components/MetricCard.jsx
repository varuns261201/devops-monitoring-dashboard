import React from 'react';
import './MetricCard.css';

function MetricCard({ title, value, unit, icon, color }) {
  return (
    <div className="metric-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-title">{title}</span>
      </div>
      <div className="metric-value">
        <span className="value">{typeof value === 'number' ? value.toFixed(1) : value}</span>
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}

export default MetricCard;
