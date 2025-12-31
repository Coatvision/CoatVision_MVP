// src/config/api/coatvision-demo.ts
import type {
  CoatVisionResult,
  CoatVisionImageRequest,
  CoatVisionLiveRequest,
} from './coatvision-types';

function createDemoResult(baseNotes: string): CoatVisionResult {
  const coverageBase = 80;
  const coverageRandom = Math.round(Math.random() * 15); // 0–15
  const coverage = coverageBase + coverageRandom;         // 80–95

  const missingAreas: string[] = [];
  const warnings: string[] = [];

  if (coverage < 85) {
    missingAreas.push('Nedre del av panelet ser ujevnt ut.');
    missingAreas.push('Overgang mot nabopanel kan ha manglende dekning.');
    warnings.push('Vurder ekstra påføring på utsatte områder.');
  } else if (coverage < 90) {
    missingAreas.push('Sjekk kantsoner og områder rundt håndtak/emblemer.');
    warnings.push(
      'Jevn dekning, men små lommer kan skjule seg i refleks og kurver.'
    );
  } else {
    warnings.push(
      'Høy og jevn dekning. Ingen åpenbare mangler på dette panelet.'
    );
  }

  return {
    coverage,
    missingAreas,
    warnings,
    notes: baseNotes,
  };
}

export async function analyzeImageDemo(
  req: CoatVisionImageRequest
): Promise<CoatVisionResult> {
  // Simulerer litt ventetid
  await new Promise((resolve) => setTimeout(resolve, 900));

  const baseNotes =
    'Dette er et demoresultat. I en ekte versjon vil resultatet komme fra en trent CoatVision-modell.';

  return createDemoResult(baseNotes);
}

export async function analyzeLiveDemo(
  req: CoatVisionLiveRequest
): Promise<CoatVisionResult> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const baseNotes =
    'Live-modus gir et raskt overslag over dekning og områder som bør sjekkes ekstra i hallen.';

  return createDemoResult(baseNotes);
}
