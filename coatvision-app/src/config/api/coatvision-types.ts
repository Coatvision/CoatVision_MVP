// Calibration types for CoatVision
export type CalibrationLight = {
  lux: number;
  frameThumb?: string;
};

export type CalibrationProfile = {
  id: string;
  workshopId: string;
  hallName: string;
  geometry: {
    L: number;
    W: number;
    H: number;
    referenceDistance: number;
    angles: { cameraToPanelDeg: number };
  };
  lightProfile: {
    low: CalibrationLight;
    normal: CalibrationLight;
    high: CalibrationLight;
  };
  learningZoneActive: boolean;
  createdAt: string;
  updatedAt?: string;
  status: 'valid' | 'inactive' | 'expired';
};
// src/config/api/coatvision-types.ts

export type CoatVisionMode = 'image' | 'live';

export type CoatVisionResult = {
  coverage: number;       // 0–100 %
  missingAreas: string[]; // beskrivelse av mulige mangler
  warnings: string[];     // generelle advarsler / ting å sjekke
  notes: string;          // lengre fritekst
};

export type CoatVisionImageRequest = {
  mode: 'image';
  /**
   * I demo-modus er dette lokal fil-URI (expo-image / ImagePicker).
   * I produksjon bør dette være en HTTP(S)-URL som backend kan lese.
   */
  imageUri: string;
  panelHint?: string;     // f.eks. "høyre dør foran"
};

export type CoatVisionLiveRequest = {
  mode: 'live';

  /**
   * Base64-kodet JPEG/PNG av ett enkelt kamera-frame.
   * Dette er det du får fra CameraView.takePictureAsync({ base64: true }).
   */
  frameBase64: string;

  /**
   * Format på bildet, normalt 'jpg' eller 'png'.
   * Vi bruker 'jpg' som standard hvis kameraet ikke oppgir noe.
   */
  frameFormat: 'jpg' | 'jpeg' | 'png';

  /**
   * (Valgfritt) Løpenummer på frame hvis du senere vil sende mange.
   */
  sequenceIndex?: number;

  /**
   * Hint om hvilket panel som analyseres (f.eks. "panser", "venstre bakskjerm").
   * Lagres i context på server-siden.
   */
  panelHint?: string;
};
