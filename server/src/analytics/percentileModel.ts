import { ConfidenceLevel, PercentileEstimate } from "../types";

// ============================================================================
// PERCENTILE MODEL
//
// THIS IS NOT AN OFFICIAL CAT PERCENTILE. It is a statistical estimate,
// labeled as such everywhere it's surfaced (the type is literally named
// PercentileEstimate, and every UI label built on it says "Estimated").
//
// Methodology: model the population of CAT test-takers' calibrated scores as
// approximately normally distributed, and read off where a given score falls
// on that curve. The mean/SD below are NOT sourced from any official CAT
// dataset — they're a rough, intentionally-labeled approximation built from
// commonly-discussed general characteristics of recent-year CAT score
// distributions (heavy left skew: most candidates, across a full population
// that includes serious and casual test-takers alike, score low relative to
// the maximum, because of time pressure and negative marking). Anyone with
// access to verified historical CAT score-vs-percentile data can replace the
// constants in PERCENTILE_CALIBRATION below — nothing else in this file, or
// anything that calls it, needs to change.
// ============================================================================

export const PERCENTILE_CALIBRATION = {
  /** Out of 204 (68 questions x 3 marks) for the full mock. */
  assumedMeanRawScore: 24,
  assumedSdRawScore: 26,
  maxRawScore: 204,
  confidenceRangeMargin: { High: 0.6, Medium: 1.5, Low: 3.0 } as Record<ConfidenceLevel, number>,
  classificationThresholds: { excellent: 95, good: 80, average: 60 },
};

/** Abramowitz & Stegun 7.1.26 approximation of the error function — accurate to
 * within ~1.5e-7, verified against Python's math.erf during development. Avoids
 * pulling in a stats dependency for one function. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-ax * ax);
  return sign * y;
}

function normalCdfPct(x: number, mean: number, sd: number): number {
  const z = (x - mean) / (sd * Math.SQRT2);
  return 0.5 * (1 + erf(z)) * 100;
}

function clipPercentile(p: number): number {
  return Math.min(99.9, Math.max(0.1, p));
}

function determineConfidence(attemptRatePct: number, zScoreAbs: number): ConfidenceLevel {
  if (attemptRatePct < 30 || zScoreAbs > 2.5) return "Low";
  if (attemptRatePct < 60 || zScoreAbs > 1.5) return "Medium";
  return "High";
}

/**
 * @param rawScore actual marks scored
 * @param maxRawScore maximum possible marks for this scope (overall mock or one section)
 * @param calibrationFactor from difficultyCalibration — adjusts for this mock/section's difficulty mix
 * @param attemptRatePct attempts / total questions in this scope, as a percentage — used for confidence
 */
export function estimatePercentile(rawScore: number, maxRawScore: number, calibrationFactor: number, attemptRatePct: number): PercentileEstimate {
  const scaleFactor = maxRawScore / PERCENTILE_CALIBRATION.maxRawScore;
  const mean = PERCENTILE_CALIBRATION.assumedMeanRawScore * scaleFactor;
  const sd = PERCENTILE_CALIBRATION.assumedSdRawScore * scaleFactor;

  const calibratedScore = rawScore * calibrationFactor;
  const zScore = (calibratedScore - mean) / sd;

  const percentile = clipPercentile(normalCdfPct(calibratedScore, mean, sd));
  const confidence = determineConfidence(attemptRatePct, Math.abs(zScore));
  const margin = PERCENTILE_CALIBRATION.confidenceRangeMargin[confidence];

  const range: [number, number] = [clipPercentile(percentile - margin), clipPercentile(percentile + margin)];

  return {
    estimate: Math.round(percentile * 10) / 10,
    range: [Math.round(range[0] * 10) / 10, Math.round(range[1] * 10) / 10],
    confidence,
  };
}

export function classifyFromPercentile(percentile: number): "Excellent" | "Good" | "Average" | "Needs Improvement" {
  const { excellent, good, average } = PERCENTILE_CALIBRATION.classificationThresholds;
  if (percentile >= excellent) return "Excellent";
  if (percentile >= good) return "Good";
  if (percentile >= average) return "Average";
  return "Needs Improvement";
}
