// Calibration profile API (demo only)
import type { CalibrationProfile } from './coatvision-types';

// Real API implementation for fetching calibration profiles
export async function getCalibrationProfiles(): Promise<CalibrationProfile[]> {
  const baseUrl = (process?.env?.EXPO_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
  const apiKey = (process?.env?.EXPO_PUBLIC_API_KEY as string) ?? 'dev-key';

  const res = await fetch(`${baseUrl}/api/calibration/list`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'Authorization': 'operator',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch calibration profiles');
  const data = await res.json();
  // Backend returns { items: [...] }
  return Array.isArray(data) ? data : (data.items ?? []);
}
import { FLAGS } from "../flags";

// Re-export canonical types from coatvision-types so other modules can import
// from '@/src/config/api/coatvision' and get the same definitions.
export type {
  CoatVisionResult,
  CoatVisionImageRequest,
  CoatVisionLiveRequest,
  CoatVisionMode,
} from './coatvision-types';

import {
  analyzeImageHttp,
  analyzeLiveHttp,
} from './coatvision-http';
import {
  analyzeImageDemo,
  analyzeLiveDemo,
} from './coatvision-demo';
// NOTE: avoid importing internal expo-router paths; not needed here.

export async function analyzeImage(req: import('./coatvision-types').CoatVisionImageRequest) {
  if (FLAGS.coatVision.useRemoteApi) return analyzeImageHttp(req as any);
  return analyzeImageDemo(req as any);
}

export async function analyzeLive(req: import('./coatvision-types').CoatVisionLiveRequest) {
  if (FLAGS.coatVision.useRemoteApi) return analyzeLiveHttp(req as any);
  return analyzeLiveDemo(req as any);
}

