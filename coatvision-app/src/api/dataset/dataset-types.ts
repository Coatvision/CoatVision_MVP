// src/api/dataset/dataset-types.ts

/**
 * Metadata for et treningsbilde
 */
export type TrainingImageMetadata = {
  // Jobinformasjon
  jobId?: string;
  sessionId?: string;
  
  // Kjøretøyinfo
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehiclePlate?: string;
  
  // Panel/område
  panelName?: string; // "høyre dør foran", "panser", etc.
  panelSide?: 'left' | 'right' | 'front' | 'rear' | 'top';
  
  // Coating-info
  coatingBrand?: string;
  coatingProduct?: string;
  coatingBatch?: string;
  curingTime?: number; // minutter
  
  // Bildeforhold
  distance?: number; // cm fra panel
  lightingCondition?: 'indoor' | 'outdoor' | 'mixed';
  backgroundNoise?: 'clean' | 'moderate' | 'busy';
  
  // Labels (ground truth)
  hasCoating?: boolean;
  coatingCoverage?: number; // 0-100%
  defectType?: 'none' | 'scratch' | 'oxidation' | 'missing' | 'damaged';
  
  // Teknisk
  capturedAt?: string; // ISO timestamp
  capturedBy?: string; // bruker/operatør
  deviceModel?: string;
  appVersion?: string;
};

/**
 * Et treningsbilde med metadata
 */
export type TrainingImage = {
  id: string;
  imageUrl: string;
  imageUri?: string; // lokal URI før opplasting
  metadata: TrainingImageMetadata;
  uploadedAt?: string;
  status: 'pending' | 'uploaded' | 'processed' | 'failed';
};

/**
 * Request for å laste opp treningsbilde
 */
export type UploadTrainingImageRequest = {
  imageBase64: string;
  imageFormat: string; // 'jpeg', 'png'
  metadata: TrainingImageMetadata;
};

/**
 * Response etter vellykket opplasting
 */
export type UploadTrainingImageResponse = {
  id: string;
  imageUrl: string;
  uploadedAt: string;
};

/**
 * Statistikk for datasett
 */
export type DatasetStats = {
  totalImages: number;
  imagesByLabel: Record<string, number>;
  imagesByBrand: Record<string, number>;
  imagesByPanel: Record<string, number>;
  lastUpdated: string;
};

/**
 * Training session info
 */
export type TrainingSession = {
  id: string;
  name: string;
  brand: string; // "BrandX_Coating", "LYX_Quartz_9H_Pro"
  phase: string; // "Fase_1.1_Bil_Panel_Fargekode"
  startedAt: string;
  completedAt?: string;
  imageCount: number;
  status: 'active' | 'completed' | 'failed';
};
