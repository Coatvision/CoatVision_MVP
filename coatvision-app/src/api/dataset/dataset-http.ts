// src/api/dataset/dataset-http.ts
import { FLAGS } from '@/src/config/flags';
import type {
  UploadTrainingImageRequest,
  UploadTrainingImageResponse,
  DatasetStats,
  TrainingSession,
} from './dataset-types';

export class DatasetApiError extends Error {
  status: number | null;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number | null,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const RAW_BASE_URL = FLAGS.dataset?.apiBaseUrl ?? '';

function getBaseUrl(): string {
  return RAW_BASE_URL.replace(/\/+$/, '');
}

async function postJson<TReq, TRes>(
  path: string,
  body: TReq
): Promise<TRes> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new DatasetApiError(
      'Dataset API base URL er ikke konfigurert (EXPO_PUBLIC_DATASET_API_BASE_URL mangler).',
      null,
      'config_error'
    );
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Ignorer parse-feil
  }

  if (!res.ok) {
    const errorPayload = json as { error?: string; message?: string } | null;
    const code = errorPayload?.error;
    const msg =
      errorPayload?.message ||
      `Dataset API returnerte status ${res.status}`;
    throw new DatasetApiError(msg, res.status, code);
  }

  return json as TRes;
}

async function getJson<TRes>(path: string): Promise<TRes> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new DatasetApiError(
      'Dataset API base URL er ikke konfigurert.',
      null,
      'config_error'
    );
  }

  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Ignorer
  }

  if (!res.ok) {
    const errorPayload = json as { error?: string; message?: string } | null;
    const msg =
      errorPayload?.message ||
      `Dataset API returnerte status ${res.status}`;
    throw new DatasetApiError(msg, res.status, errorPayload?.error);
  }

  return json as TRes;
}

/**
 * Last opp et treningsbilde til dataset
 */
export async function uploadTrainingImageHttp(
  req: UploadTrainingImageRequest
): Promise<UploadTrainingImageResponse> {
  return await postJson<UploadTrainingImageRequest, UploadTrainingImageResponse>(
    '/v1/dataset/upload',
    req
  );
}

/**
 * Hent statistikk over datasett
 */
export async function getDatasetStatsHttp(): Promise<DatasetStats> {
  return await getJson<DatasetStats>('/v1/dataset/stats');
}

/**
 * Hent liste over training sessions
 */
export async function getTrainingSessionsHttp(): Promise<TrainingSession[]> {
  return await getJson<TrainingSession[]>('/v1/dataset/sessions');
}
