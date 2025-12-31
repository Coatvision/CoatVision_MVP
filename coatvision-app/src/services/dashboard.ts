/**
 * Dashboard service using backend proxy endpoints.
 * Reads summary and latest analyses from Supabase via backend.
 */

const VITE_BACKEND_URL = (import.meta as any)?.env?.VITE_BACKEND_URL ?? '';
const BASE = (VITE_BACKEND_URL || 'http://127.0.0.1:8001').replace(/\/$/, '');

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchDashboardSummary(): Promise<any> {
  return get('/api/dashboard/summary');
}

export async function fetchLatestAnalyses(limit = 10): Promise<any> {
  const q = new URLSearchParams({ limit: String(limit) }).toString();
  return get(`/api/dashboard/latest?${q}`);
}

export default { fetchDashboardSummary, fetchLatestAnalyses };
