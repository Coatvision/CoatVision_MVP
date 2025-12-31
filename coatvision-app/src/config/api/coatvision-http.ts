// src/config/api/coatvision-http.ts
import { FLAGS } from '@/src/config/flags';
import type {
  CoatVisionResult,
  CoatVisionImageRequest,
  CoatVisionLiveRequest,
} from './coatvision-types';

type AnalysisResponsePayload = {
  id: string;
  mode: 'image' | 'live';
  createdAt: string;
  result: CoatVisionResult;
};

type ErrorResponsePayload = {
  error: string;
  message: string;
  details?: Record<string, unknown>;
};

export class CoatVisionApiError extends Error {
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

const RAW_BASE_URL = FLAGS.coatVision?.apiBaseUrl ?? '';

function getBaseUrl(): string {
  // Fjern evt. ekstra / på slutten
  return RAW_BASE_URL.replace(/\/+$/, '');
}

async function postJson<TReq, TRes>(
  path: string,
  body: TReq
): Promise<TRes> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new CoatVisionApiError(
      'CoatVision API base URL er ikke konfigurert (EXPO_PUBLIC_COATVISION_API_BASE_URL mangler).',
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
    // Ignorer parse-feil, håndteres nedenfor
  }

  if (!res.ok) {
    const errorPayload = json as ErrorResponsePayload | null;
    const code = errorPayload?.error;
    const msg =
      errorPayload?.message ||
      `CoatVision API returnerte status ${res.status}`;
    throw new CoatVisionApiError(msg, res.status, code, errorPayload?.details);
  }

  return json as TRes;
}

/**
 * Kall til backend for bildeanalyse.
 * Viktig: i produksjon må imageUri være en URL som serveren kan nå
 * (f.eks. til et opplastet bilde i S3, Azure Blob e.l.).
 */
export async function analyzeImageHttp(
  req: CoatVisionImageRequest
): Promise<CoatVisionResult> {
  const payload = {
    mode: 'image' as const,
    image: {
      // I dag: vi antar at imageUri allerede er en URL backend kan lese.
      // Demo/utvikling: du kan fortsatt bruke demo-klienten; remote-slåes ikke på før du setter env-variabler.
      imageUrl: req.imageUri,
    },
    context: req.panelHint
      ? {
          panelHint: req.panelHint,
        }
      : undefined,
  };

  const response = await postJson<
    typeof payload,
    AnalysisResponsePayload
  >('/v1/coatvision/analyze-image', payload);

  return response.result;
}

/**
 * Kall til backend for live-analyse.
 * Her følger vi LiveAnalysisRequest-skjemaet i OpenAPI:
 * {
 *   "mode": "live",
 *   "frame": {
 *     "frameBase64": "...",
 *     "frameFormat": "jpeg",
 *     "sequenceIndex": 0
 *   },
 *   "context": { "panelHint": "panser" }
 * }
 */
export async function analyzeLiveHttp(
  req: CoatVisionLiveRequest
): Promise<CoatVisionResult> {
  const payload = {
    mode: 'live' as const,
    frame: {
      frameBase64: req.frameBase64,
      frameFormat: req.frameFormat,
      sequenceIndex:
        typeof req.sequenceIndex === 'number'
          ? req.sequenceIndex
          : undefined,
    },
    context: req.panelHint
      ? {
          panelHint: req.panelHint,
        }
      : undefined,
  };

  const response = await postJson<
    typeof payload,
    AnalysisResponsePayload
  >('/v1/coatvision/analyze-live', payload);

  return response.result;
}
