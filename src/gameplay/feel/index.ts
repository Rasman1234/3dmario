/** Phase 18 — Character Feel System public API. */

export { CharacterFeelSystem, type FeelSnapshot } from './CharacterFeelSystem';
export { FeelDashboard, type FeelDashboardState } from './FeelDashboard';
export { JumpTelemetry, type JumpRecord } from './JumpTelemetry';
export { MovementGenome, type GenomeEntry } from './MovementGenome';
export { MovementRegression, type RegressionResult } from './MovementRegression';
export { PlayerFeedbackCollector, type PlayerFeedbackEntry } from './PlayerFeedback';
export { loadActivePreset, getAllPresets, DEFAULT_FEEL_CONFIG, FEEL_BUDGETS } from './FeelConfig';
export { evaluateCurve, curveMoveToward } from './MovementCurves';
export { GOLDEN_REPLAY, compareToGolden } from './GoldenReplay';
