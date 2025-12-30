/**
 * Complete CoatVision Core API Client
 * Implements all endpoints for production use
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || '';

interface ApiConfig {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // Analysis endpoints
  async analyzeWash(imageBase64: string, jobId?: string, panelId?: string) {
    return this.request('/api/analyze/wash', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        job_id: jobId,
        panel_id: panelId,
      }),
    });
  }

  async analyzeDefects(imageBase64: string, jobId?: string, panelId?: string) {
    return this.request('/api/analyze/defects', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        job_id: jobId,
        panel_id: panelId,
      }),
    });
  }

  async analyzeCoating(imageBase64: string, jobId?: string, panelId?: string, modelProfileId?: string) {
    return this.request('/api/analyze/coating', {
      method: 'POST',
      body: JSON.stringify({
        image_base64: imageBase64,
        job_id: jobId,
        panel_id: panelId,
        model_profile_id: modelProfileId,
      }),
    });
  }

  async analyzeLive(frameBase64: string, calibration?: any) {
    return this.request('/api/analyze/live', {
      method: 'POST',
      body: JSON.stringify({
        frame_base64: frameBase64,
        calibration,
      }),
    });
  }

  // Calibration endpoints
  async createCalibration(data: {
    workshop_id: string;
    hall_name: string;
    geometry: { length_m: number; width_m: number; height_m: number };
    light_profile: { low_lux: number; normal_lux: number; high_lux: number };
  }) {
    return this.request('/api/calibration/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async evaluateCalibration(data: {
    calibration_profile_id: string;
    camera_pose: [number, number, number];
    panel_point: [number, number, number];
    light_dir: [number, number, number];
    lux_value: number;
  }) {
    return this.request('/api/calibration/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Job endpoints
  async createJob(data: {
    workshop_id: string;
    vehicle_label: string;
    package?: string;
  }) {
    return this.request('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPanel(jobId: string, data: {
    name: string;
    area_m2?: number;
  }) {
    return this.request(`/api/jobs/${jobId}/panels`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async aggregateJob(jobId: string) {
    return this.request(`/api/jobs/${jobId}/aggregate`, {
      method: 'POST',
    });
  }

  async aggregatePanel(panelId: string) {
    return this.request(`/api/panels/${panelId}/aggregate`, {
      method: 'POST',
    });
  }

  // Capture endpoints
  async createCapture(data: {
    job_id?: string;
    panel_id?: string;
    calibration_profile_id?: string;
    phase: string;
    type: string;
    storage_path?: string;
    in_learning_zone: boolean;
  }) {
    return this.request('/api/captures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Price estimation
  async estimatePrice(data: {
    dc: number;
    dirt_level: number;
    procedure_weight: number;
    time_hours: number;
  }) {
    return this.request('/api/estimate/price', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Training endpoints
  async createTrainingDataset(data: {
    name: string;
    phase: string;
    type: string;
    source_workshops?: string[];
  }) {
    return this.request('/api/training/datasets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTrainingDatasets() {
    return this.request('/api/training/datasets', {
      method: 'GET',
    });
  }

  async createTrainingSession(data: {
    model_profile_id: string;
    phase: string;
    dataset_ids?: string[];
  }) {
    return this.request('/api/training/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listTrainingSessions() {
    return this.request('/api/training/sessions', {
      method: 'GET',
    });
  }

  async getTrainingSession(sessionId: string) {
    return this.request(`/api/training/sessions/${sessionId}`, {
      method: 'GET',
    });
  }

  async startTrainingSession(sessionId: string) {
    return this.request(`/api/training/sessions/${sessionId}/start`, {
      method: 'POST',
    });
  }

  async completeTrainingSession(sessionId: string) {
    return this.request(`/api/training/sessions/${sessionId}/complete`, {
      method: 'POST',
    });
  }

  async getTrainingPhases() {
    return this.request('/api/training/phases', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_KEY);
export default apiClient;
