import type { MovementConfig } from '../MovementConfig';
import feelData from '../../data/feel.json';
import presetsData from '../../data/presets.json';

export interface CurveShape {
  start: number;
  peak: number;
  end: number;
}

export interface FeelConfig {
  presetId: string;
  evidenceRef: string;
  accelCurve: CurveShape;
  decelCurve: CurveShape;
  momentumCurve: CurveShape;
  airControl: number;
  cornerCorrection: number;
  groundSnap: number;
  ledgeSnap: number;
  ledgeSnapDistance: number;
  apexHangGravityScale: number;
  apexHangVelocityThreshold: number;
  landingRecoveryDuration: number;
  landingRecoverySpeedScale: number;
  fastFallMultiplier: number;
  fastFallThreshold: number;
  stepOffset: number;
  stepOffsetMin: number;
  slopeSpeedScale: number;
  platformVelocityTransfer: number;
  jumpRatingWeights: {
    apex: number;
    duration: number;
    airControl: number;
    correction: number;
    landing: number;
  };
}

export interface MovementPreset {
  id: string;
  label: string;
  labRank: number;
  jumpSuccessRate: number;
  movement: Partial<MovementConfig>;
}

export const DEFAULT_FEEL_CONFIG: FeelConfig = feelData as FeelConfig;

export function loadActivePreset(): { feel: FeelConfig; movement: Partial<MovementConfig>; preset: MovementPreset } {
  const activeId = presetsData.active;
  const preset = presetsData.presets.find((p) => p.id === activeId) ?? presetsData.presets[0];
  return {
    feel: { ...DEFAULT_FEEL_CONFIG, presetId: preset.id },
    movement: preset.movement,
    preset: preset as MovementPreset,
  };
}

export function getAllPresets(): MovementPreset[] {
  return presetsData.presets as MovementPreset[];
}

export const FEEL_BUDGETS = {
  maxJumpLog: 128,
  maxGenomeEntries: 64,
  maxRegressionHistory: 32,
  targetSimMs: 4.17,
  maxAllocPerFrame: 4096,
} as const;
