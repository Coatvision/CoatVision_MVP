// src/api/dataset/dataset-demo.ts
import type {
  UploadTrainingImageRequest,
  UploadTrainingImageResponse,
  DatasetStats,
  TrainingSession,
} from './dataset-types';

/**
 * Demo: Simuler opplasting av treningsbilde
 */
export async function uploadTrainingImageDemo(
  req: UploadTrainingImageRequest
): Promise<UploadTrainingImageResponse> {
  // Simuler ventetid
  await new Promise((resolve) => setTimeout(resolve, 800));

  const id = `demo-${Date.now()}-${Math.round(Math.random() * 10000)}`;
  const imageUrl = `https://demo.storage/training/${id}.${req.imageFormat}`;

  return {
    id,
    imageUrl,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Demo: Hent datasett-statistikk
 */
export async function getDatasetStatsDemo(): Promise<DatasetStats> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    totalImages: 1247,
    imagesByLabel: {
      'has_coating': 892,
      'no_coating': 355,
    },
    imagesByBrand: {
      'BrandX_Coating': 623,
      'LYX_Quartz_9H_Pro': 624,
    },
    imagesByPanel: {
      'høyre_dør_foran': 312,
      'venstre_dør_foran': 298,
      'panser': 245,
      'bagasjerom': 201,
      'tak': 191,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Demo: Hent training sessions
 */
export async function getTrainingSessionsDemo(): Promise<TrainingSession[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 'session-1',
      name: 'BrandX Coating - Fase 1.1',
      brand: 'BrandX_Coating',
      phase: 'Fase_1.1_Bil_Panel_Fargekode',
      startedAt: '2025-01-15T10:00:00Z',
      completedAt: '2025-02-20T14:30:00Z',
      imageCount: 623,
      status: 'completed',
    },
    {
      id: 'session-2',
      name: 'LYX Quartz 9H Pro - Fase 2.1',
      brand: 'LYX_Quartz_9H_Pro',
      phase: 'Fase_2.1_Coating_vs_IkkeCoating',
      startedAt: '2025-02-21T09:00:00Z',
      imageCount: 624,
      status: 'active',
    },
  ];
}
