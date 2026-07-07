import goldenData from '../../data/golden-replay.json';

export interface GoldenReplayBaseline {
  version: number;
  presetId: string;
  sceneId: string;
  seed: number;
  ticks: number;
  positionHash: string;
  metrics: {
    jumpSuccessRate: number;
    avgLandingVelocity: number;
    maxJumpApex: number;
  };
}

export const GOLDEN_REPLAY: GoldenReplayBaseline = goldenData as GoldenReplayBaseline;

export function compareToGolden(
  positionHash: string,
  metrics: { jumpSuccessRate: number; avgLandingVelocity: number; maxJumpApex: number },
): { pass: boolean; hashMatch: boolean; metricDeltas: Record<string, number> } {
  const hashMatch = positionHash === GOLDEN_REPLAY.positionHash;
  const metricDeltas = {
    jumpSuccessRate: metrics.jumpSuccessRate - GOLDEN_REPLAY.metrics.jumpSuccessRate,
    avgLandingVelocity: metrics.avgLandingVelocity - GOLDEN_REPLAY.metrics.avgLandingVelocity,
    maxJumpApex: metrics.maxJumpApex - GOLDEN_REPLAY.metrics.maxJumpApex,
  };
  const metricsOk =
    metricDeltas.jumpSuccessRate >= -0.05 &&
    metricDeltas.avgLandingVelocity <= 1.5 &&
    metricDeltas.maxJumpApex >= -0.5;
  return { pass: hashMatch || metricsOk, hashMatch, metricDeltas };
}
