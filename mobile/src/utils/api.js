// mobile/src/utils/api.js
// v2
// API_BASE can be configured via environment variable or app config
// Default to localhost for emulator, change for physical device testing
// For Android emulator use: http://10.0.2.2:8000/api
// For iOS simulator use: http://localhost:8000/api
// For physical device use your computer's LAN IP

const getApiBase = () => {
  // Check if running in Expo with environment variables
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE;
  }
  // Default fallback - update this for your environment
  return "http://localhost:8000/api";
};

export const API_BASE = getApiBase();


/**
 * Helper function to make API requests
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get the full URL for the report endpoint
 */
export function getReportUrl(jobId = null) {
  const base = `${API_BASE}/report/demo`;
  return jobId ? `${base}?job_id=${jobId}` : base;
}
