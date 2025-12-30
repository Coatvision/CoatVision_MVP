

// Les miljøvariabler fra Expo/Vite (EXPO_PUBLIC_* eller VITE_* i klienten)
const HELP_DOCS_ENV = process.env.EXPO_PUBLIC_HELP_DOCS ?? (import.meta as any)?.env?.VITE_HELP_DOCS;

// CoatVision API konfigurasjon
const VITE_BACKEND_URL = (import.meta as any)?.env?.VITE_BACKEND_URL ?? '';
const COATVISION_API_BASE_URL = (
  process.env.EXPO_PUBLIC_COATVISION_API_BASE_URL ?? VITE_BACKEND_URL ?? ''
).trim();
const COATVISION_USE_REMOTE =
  process.env.EXPO_PUBLIC_COATVISION_USE_REMOTE === '1' ||
  ((import.meta as any)?.env?.VITE_COATVISION_USE_REMOTE === '1');

// Dataset/Training API konfigurasjon (helt separat!)
const DATASET_API_BASE_URL = (
  process.env.EXPO_PUBLIC_DATASET_API_BASE_URL ??
  (import.meta as any)?.env?.VITE_DATASET_API_BASE_URL ??
  ''
).trim();
const DATASET_USE_REMOTE =
  process.env.EXPO_PUBLIC_DATASET_USE_REMOTE === '1' ||
  ((import.meta as any)?.env?.VITE_DATASET_USE_REMOTE === '1');

export const FLAGS = {
  // Viser/skjuler intern hjelpeside (du brukte denne fra før)
  helpDocs: (HELP_DOCS_ENV ?? '').trim() === '1',

  // Egen seksjon for CoatVision-konfig (analyse)
  coatVision: {
    /**
     * Skal vi forsøke å bruke remote CoatVision-API?
     * Denne blir KUN true hvis:
     *   - EXPO_PUBLIC_COATVISION_USE_REMOTE=1
     *   - og EXPO_PUBLIC_COATVISION_API_BASE_URL er satt
     */
    useRemoteApi:
      COATVISION_USE_REMOTE && COATVISION_API_BASE_URL.length > 0,

    /**
     * Base URL til backend, f.eks.:
     * https://api.lyxvision.no
     */
    apiBaseUrl: COATVISION_API_BASE_URL,
  },

  // Egen seksjon for Dataset/Training (helt uavhengig av CoatVision!)
  dataset: {
    /**
     * Skal vi bruke remote Dataset API?
     * Denne blir KUN true hvis:
     *   - EXPO_PUBLIC_DATASET_USE_REMOTE=1
     *   - og EXPO_PUBLIC_DATASET_API_BASE_URL er satt
     */
    useRemoteApi:
      DATASET_USE_REMOTE && DATASET_API_BASE_URL.length > 0,

    /**
     * Base URL til dataset/training backend, f.eks.:
     * https://dataset.lyxvision.no
     */
    apiBaseUrl: DATASET_API_BASE_URL,
  },
};
