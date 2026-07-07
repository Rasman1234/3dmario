import type { Vec3 } from '../domain/types';
import type { MovementConfig } from '../gameplay/MovementController';
import type { MovementState } from '../gameplay/MovementState';

/** Phase 17 — Gameplay Research Lab shared types. */

export type LabSceneId =
  | 'physics_isolation'
  | 'jump_laboratory'
  | 'gap_laboratory'
  | 'platform_laboratory';

export interface InputSnapshot {
  moveX: number;
  moveZ: number;
  jumpPressed: boolean;
  jumpHeld: boolean;
  sprint: boolean;
  crouch: boolean;
  attack: boolean;
}

export interface LabFrame {
  tick: number;
  dt: number;
  position: Vec3;
  velocity: Vec3;
  acceleration: Vec3;
  grounded: boolean;
  onWall: boolean;
  state: MovementState;
  jumpApex: number;
  landingVelocity: number;
  inputLatencyMs: number;
}

export interface TelemetryFrame extends LabFrame {
  cameraDistance: number;
  cameraOcclusion: number;
  failureType?: string;
  recoveryTick?: number;
}

export interface LabReport {
  sceneId: LabSceneId;
  seed: number;
  fixedDt: number;
  frameCount: number;
  duration: number;
  frames: LabFrame[];
  metrics: LabMetrics;
  positionHash: string;
}

export interface LabMetrics {
  jumpCount: number;
  jumpSuccessRate: number;
  missedJumpRate: number;
  avgLandingVelocity: number;
  maxJumpApex: number;
  deathCount: number;
  recoveryCount: number;
  completionTime: number;
  groundedPercent: number;
}

export interface ReplayFile {
  version: number;
  seed: number;
  sceneId: LabSceneId;
  fixedDt: number;
  movementConfig: Partial<MovementConfig>;
  frames: InputSnapshot[];
  metadata?: Record<string, unknown>;
}

export interface HypothesisRecord {
  id: string;
  statement: string;
  nullHypothesis: string;
  metric: keyof LabMetrics | 'positionHash';
  targetDirection: 'increase' | 'decrease' | 'stable';
  prior: number;
  posterior: number;
  ciLow: number;
  ciHigh: number;
  status: 'open' | 'testing' | 'supported' | 'refuted' | 'inconclusive';
  falsifiers: FalsifierSpec[];
  alternatives: string[];
  experimentIds: string[];
}

export interface FalsifierSpec {
  id: string;
  description: string;
  scenario: FalsificationScenario;
  critical: boolean;
}

export type FalsificationScenario =
  | 'high_gravity'
  | 'low_friction'
  | 'extreme_jump_timing'
  | 'high_latency'
  | 'low_fps'
  | 'bad_camera';

export interface ExperimentSpec {
  id: string;
  hypothesisId: string;
  sceneId: LabSceneId;
  seed: number;
  durationTicks: number;
  movementOverrides: Partial<MovementConfig>;
  inputSequence: InputSnapshot[];
  falsificationScenario?: FalsificationScenario;
  metadata?: Record<string, unknown>;
}

export interface ExperimentResult {
  spec: ExperimentSpec;
  report: LabReport;
  telemetry: TelemetryFrame[];
  durationMs: number;
  passed: boolean;
}

export interface ExperimentComparison {
  baselineId: string;
  variantId: string;
  metricDeltas: Record<string, number>;
  effectSizes: Record<string, number>;
  confidenceIntervals: Record<string, [number, number]>;
  ranking: string[];
  recommendation: string;
}

export interface EvidenceArtifact {
  id: string;
  hypothesisId: string;
  experimentId: string;
  timestamp: string;
  conclusion: 'supported' | 'refuted' | 'inconclusive';
  metrics: LabMetrics;
  posterior: number;
  ciLow: number;
  ciHigh: number;
  rawSummary: string;
}

export interface ExplainableBundle {
  id: string;
  experimentId: string;
  summary: string;
  hypothesis: string;
  evidence: string[];
  rejectedAlternatives: { alternative: string; reason: string }[];
  confidenceUpdate: { before: number; after: number; ci: [number, number] };
  remainingUncertainty: string;
  recommendation: string;
}

export interface ReadinessSnapshot {
  researchReadiness: number;
  implementationReadiness: number;
  gameplayReadiness: number;
  verticalSliceReadiness: number;
  details: Record<string, boolean>;
}

export interface ResearchDashboardState {
  hypotheses: HypothesisRecord[];
  activeExperiments: ExperimentResult[];
  readiness: ReadinessSnapshot;
  latestComparison?: ExperimentComparison;
  telemetrySeries: { tick: number; value: number; label: string }[];
  falsificationStatus: { id: string; passed: boolean; scenario: string }[];
  informationGain: number;
  uncertainty: number;
}

export const RESEARCH_BUDGETS = {
  maxFramesInMemory: 3600,
  maxReplayFrames: 3600,
  maxBatchSize: 200,
  targetStepMs: 1.0,
  maxMemoryMb: 12,
} as const;
