// Simple AsyncStorage-based job & panel storage for MVP.
// In production, replace with Supabase/Postgres integration.
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOBS_KEY = '@lyx_jobs_v1';
const PANELS_KEY = '@lyx_panels_v1';

export type Job = {
  id: string;
  status: 'planning' | 'in_progress' | 'completed';
  package?: 'Basic' | 'Standard' | 'Premium' | 'Extreme';
  initial_dc?: number;
  final_dc?: number;
  estimated_time_minutes?: number;
};

export type Panel = {
  id: string;
  jobId: string;
  name: string;
  area_m2?: number;
  initial_dc?: number;
  final_dc?: number;
  cqi?: number;
  cvi?: number;
};

async function load<T>(key: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Storage read failed', key, e);
    return [];
  }
}

async function save<T>(key: string, items: T[]): Promise<void> {
  try { await AsyncStorage.setItem(key, JSON.stringify(items)); } catch (e) { console.warn('Storage write failed', key, e); }
}

export async function listJobs(): Promise<Job[]> {
  return load<Job>(JOBS_KEY);
}

export async function getJob(id: string): Promise<Job | null> {
  const all = await listJobs();
  return all.find(j => j.id === id) || null;
}

export async function addJob(input: Partial<Job>): Promise<Job> {
  const existing = await listJobs();
  const job: Job = {
    id: `${Date.now()}-${Math.round(Math.random()*1_000_000)}`,
    status: input.status || 'planning',
    package: input.package,
    initial_dc: input.initial_dc,
    final_dc: input.final_dc,
    estimated_time_minutes: input.estimated_time_minutes || 180,
  };
  const updated = [job, ...existing].slice(0, 50);
  await save<Job>(JOBS_KEY, updated);
  return job;
}

export async function listPanels(jobId: string): Promise<Panel[]> {
  const panels = await load<Panel>(PANELS_KEY);
  return panels.filter(p => p.jobId === jobId);
}

export async function getPanelsForJob(jobId: string): Promise<Panel[]> {
  return listPanels(jobId);
}

export async function addPanel(jobId: string, input: Partial<Panel>): Promise<Panel> {
  const panels = await load<Panel>(PANELS_KEY);
  const panel: Panel = {
    id: `${Date.now()}-${Math.round(Math.random()*1_000_000)}`,
    jobId,
    name: input.name || 'panel',
    area_m2: input.area_m2,
    initial_dc: input.initial_dc,
    final_dc: input.final_dc,
    cqi: input.cqi,
    cvi: input.cvi,
  };
  const updated = [panel, ...panels].slice(0, 200);
  await save<Panel>(PANELS_KEY, updated);
  return panel;
}
