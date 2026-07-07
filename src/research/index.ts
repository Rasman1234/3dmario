/** Phase 17 — Gameplay Research Laboratory public API. */

export { ResearchLab, type IResearchLab } from './ResearchLab';
export type * from './types';
export { RESEARCH_BUDGETS } from './types';
export { MovementSandbox, hashPositions, forwardJumpSequence, FIXED_DT } from './sandbox/MovementSandbox';
export { LAB_SCENE_IDS } from './sandbox/LabScenes';
export { ExperimentRunner, createJumpExperiment } from './experiments/ExperimentRunner';
export { HypothesisRegistry } from './experiments/HypothesisRegistry';
export { EvidencePipeline } from './evidence/EvidencePipeline';
export { ResearchDashboard } from './dashboard/ResearchDashboard';
