import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

export const fetchMetrics = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/metrics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

export const fetchHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error fetching health:', error);
    throw error;
  }
};

export const fetchMetricsHistory = async (limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/metrics/history?limit=${limit}`);
    return response.data.metrics || [];
  } catch (error) {
    console.error('Error fetching metrics history:', error);
    return []; // Return empty array if DB fetch fails
  }
};
