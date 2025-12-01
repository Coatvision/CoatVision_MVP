// mobile/src/utils/api.js
// v2
// Sett dette til din backend-host (bruk emulator IP eller LAN-IP ved testing)
export const API_BASE = "http://192.168.1.10:8000/api"; // bytt til riktig adresse

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
