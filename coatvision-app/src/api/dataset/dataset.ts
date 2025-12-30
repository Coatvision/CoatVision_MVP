// src/api/dataset/dataset.ts
import { FLAGS } from '@/src/config/flags';
import type {
  UploadTrainingImageRequest,
  UploadTrainingImageResponse,
  DatasetStats,
  TrainingSession,
} from './dataset-types';
import {
  uploadTrainingImageDemo,
  getDatasetStatsDemo,
  getTrainingSessionsDemo,
} from './dataset-demo';
import {
  uploadTrainingImageHttp,
  getDatasetStatsHttp,
  getTrainingSessionsHttp,
  DatasetApiError,
} from './dataset-http';

// Re-eksporter typer
export * from './dataset-types';
export { DatasetApiError };

const useRemoteApi = FLAGS.dataset?.useRemoteApi === true;

/**
 * Last opp et treningsbilde til dataset
 * - Hvis useRemoteApi = true: forsøk remote API, fall tilbake til demo ved feil
 * - Hvis useRemoteApi = false: bruk ren demo
 */
export async function uploadTrainingImage(
  req: UploadTrainingImageRequest
): Promise<UploadTrainingImageResponse> {
  if (useRemoteApi) {
    try {
      return await uploadTrainingImageHttp(req);
    } catch (err) {
      console.warn(
        '[Dataset] Remote upload feilet, faller tilbake til demo:',
        err instanceof Error ? err.message : String(err)
      );
      return await uploadTrainingImageDemo(req);
    }
  }

  return await uploadTrainingImageDemo(req);
}

/**
 * Hent datasett-statistikk
 */
export async function getDatasetStats(): Promise<DatasetStats> {
  if (useRemoteApi) {
    try {
      return await getDatasetStatsHttp();
    } catch (err) {
      console.warn(
        '[Dataset] Remote stats feilet, faller tilbake til demo:',
        err instanceof Error ? err.message : String(err)
      );
      return await getDatasetStatsDemo();
    }
  }

  return await getDatasetStatsDemo();
}

/**
 * Hent training sessions
 */
export async function getTrainingSessions(): Promise<TrainingSession[]> {
  if (useRemoteApi) {
    try {
      return await getTrainingSessionsHttp();
    } catch (err) {
      console.warn(
        '[Dataset] Remote sessions feilet, faller tilbake til demo:',
        err instanceof Error ? err.message : String(err)
      );
      return await getTrainingSessionsDemo();
    }
  }

  return await getTrainingSessionsDemo();
}
