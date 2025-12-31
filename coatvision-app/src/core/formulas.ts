// Core formula implementations for LYXvision / CoatVision
// All indices are clipped to [0,1] and tuned for MVP; adjust weights later.

export type DCInputs = { defectsBefore: number; defectsAfter?: number; maxDefectsReference: number };
export function computeDC({ defectsBefore, defectsAfter, maxDefectsReference }: DCInputs): number {
  const base = Math.min(defectsBefore / Math.max(maxDefectsReference, 1), 1);
  if (defectsAfter == null) return Number(base.toFixed(3));
  const improvement = Math.max(defectsBefore - defectsAfter, 0) / Math.max(defectsBefore, 1);
  const adjusted = base * (1 - improvement);
  return Number(adjusted.toFixed(3));
}

export type CQIInputs = { glossBefore: number; glossAfter: number; defectReduction: number; durabilityFactor: number };
export function computeCQI({ glossBefore, glossAfter, defectReduction, durabilityFactor }: CQIInputs): number {
  const glossGainNorm = Math.min((glossAfter - glossBefore) / Math.max(glossBefore, 1), 1);
  const raw = 0.4 * glossGainNorm + 0.4 * Math.min(defectReduction, 1) + 0.2 * Math.min(durabilityFactor, 1);
  return clip01(raw);
}

export type CVIInputs = { gNorm: number; dRed: number; wColor: number; timeMinutes: number; productDoseR: number; doseBaselineR: number };
export function computeCVI({ gNorm, dRed, wColor, timeMinutes, productDoseR, doseBaselineR }: CVIInputs): number {
  const wG = 0.55;
  const wD = 0.45;
  const efficiencyPenalty = (timeMinutes / 60) + (productDoseR / Math.max(doseBaselineR, 1));
  const numerator = wColor * (wG * clip01(gNorm) + wD * clip01(dRed));
  const raw = numerator / Math.max(efficiencyPenalty, 0.5);
  return clip01(raw);
}

export type PriceInputs = { dc: number; dirtLevel: 'light'|'medium'|'heavy'; procedure: 'Basic'|'Standard'|'Premium'|'Extreme'; timeMinutes: number; laborRate: number };
export function estimatePrice({ dc, dirtLevel, procedure, timeMinutes, laborRate }: PriceInputs): { price: number; breakdown: Record<string, number> } {
  const dirtFactor = { light: 0.9, medium: 1.0, heavy: 1.25 }[dirtLevel];
  const procedureFactor = { Basic: 1.0, Standard: 1.3, Premium: 1.6, Extreme: 2.1 }[procedure];
  const dcFactor = 1 + clip01(dc) * 0.4;
  const labor = (timeMinutes / 60) * laborRate;
  const subtotal = labor * dirtFactor * procedureFactor * dcFactor;
  return { price: Math.round(subtotal), breakdown: { labor, dirtFactor, procedureFactor, dcFactor } };
}

function clip01(v: number): number { return Math.min(Math.max(v, 0), 1); }
