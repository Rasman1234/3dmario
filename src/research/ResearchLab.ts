import type {
  LabSceneId,
  LabFrame,
  LabReport,
  ResearchDashboardState,
  ExperimentSpec,
  ExperimentResult,
  ExperimentComparison,
  EvidenceArtifact,
  ExplainableBundle,
  FalsificationScenario,
} from './types';
import type { FalsificationResult } from './falsification/FalsificationRunner';
import { MovementSandbox, forwardJumpSequence, hashPositions, FIXED_DT } from './sandbox/MovementSandbox';
import { LAB_SCENE_IDS } from './sandbox/LabScenes';
import { TelemetryCollector } from './telemetry/TelemetryCollector';
import { ReplayRecorder } from './replay/ReplayRecorder';
import { ReplayPlayer } from './replay/ReplayPlayer';
import { HypothesisRegistry } from './experiments/HypothesisRegistry';
import { ExperimentRunner, createJumpExperiment } from './experiments/ExperimentRunner';
import { ExperimentBatch } from './experiments/ExperimentBatch';
import { EvidencePipeline } from './evidence/EvidencePipeline';
import { ExplainableResults } from './evidence/ExplainableResults';
import { FalsificationRunner } from './falsification/FalsificationRunner';
import { ReadinessEstimator } from './readiness/ReadinessEstimator';
import { ParameterTuning } from './tuning/ParameterTuning';
import { StatisticalValidator } from './statistics/StatisticalValidator';
import { DeterministicClock } from './DeterministicClock';

export interface IResearchLab {
  loadScene(id: LabSceneId): Promise<void>;
  setSeed(seed: number): void;
  step(dt: number): LabFrame;
  runExperiment(spec: ExperimentSpec): Promise<ExperimentResult>;
  runBatch(specs: ExperimentSpec[]): Promise<ExperimentResult[]>;
  runFalsification(hypothesisId: string, sceneId: LabSceneId): Promise<FalsificationResult[]>;
  tuneParameters(
    hypothesisId: string,
    sceneId: LabSceneId,
    overrides: ExperimentSpec['movementOverrides'],
  ): ReturnType<ParameterTuning['applyAndRerun']>;
  exportReport(): LabReport;
  getDashboardState(): ResearchDashboardState;
  getEvidence(): EvidenceArtifact[];
  getExplainable(): ExplainableBundle[];
  getSceneIds(): LabSceneId[];
  dispose(): void;
}

/** Phase 17 — Gameplay Research Laboratory (composition root). */

export class ResearchLab implements IResearchLab {
  private readonly sandbox = new MovementSandbox();
  private readonly telemetry = new TelemetryCollector();
  private readonly replayRecorder = new ReplayRecorder();
  private readonly replayPlayer = new ReplayPlayer();
  private readonly hypotheses = new HypothesisRegistry();
  private readonly runner: ExperimentRunner;
  private readonly batch: ExperimentBatch;
  private readonly evidence = new EvidencePipeline();
  private readonly explain = new ExplainableResults();
  private readonly falsification = new FalsificationRunner();
  private readonly readiness = new ReadinessEstimator();
  private readonly tuning: ParameterTuning;
  private readonly stats = new StatisticalValidator();

  private clock = new DeterministicClock(FIXED_DT, 3600);
  private inputIndex = 0;
  private inputs = forwardJumpSequence(3600);
  private lastComparison?: ExperimentComparison;
  private falsResults: { id: string; passed: boolean; scenario: string }[] = [];
  private determinismPass = false;
  private bootMs = 0;

  constructor() {
    this.hypotheses.register(HypothesisRegistry.createDefaultM1());
    this.runner = new ExperimentRunner(this.hypotheses, this.evidence, this.explain);
    this.batch = new ExperimentBatch(this.runner);
    this.tuning = new ParameterTuning(this.runner, this.hypotheses);
  }

  async boot(sceneId: LabSceneId = 'jump_laboratory', seed = 42): Promise<void> {
    const start = performance.now();
    await this.sandbox.init();
    this.sandbox.setSeed(seed);
    await this.sandbox.loadSceneAsync(sceneId);
    this.clock.reset();
    this.inputIndex = 0;
    this.bootMs = performance.now() - start;
    this.telemetry.clear();
    this.replayRecorder.start(seed, sceneId);
  }

  async loadScene(id: LabSceneId): Promise<void> {
    await this.sandbox.loadSceneAsync(id);
    this.clock.reset();
    this.inputIndex = 0;
  }

  setSeed(seed: number): void {
    this.sandbox.setSeed(seed);
  }

  step(_dt: number): LabFrame {
    const input = this.inputs[this.inputIndex] ?? this.inputs[this.inputs.length - 1];
    const frame = this.sandbox.stepFrame(input, this.clock.currentTick);
    this.telemetry.record(frame);
    this.replayRecorder.recordInput(input);
    this.clock.advance();
    this.inputIndex++;
    return frame;
  }

  async runExperiment(spec: ExperimentSpec): Promise<ExperimentResult> {
    const result = await this.runner.run(spec);
    return result;
  }

  async runBatch(specs: ExperimentSpec[]): Promise<ExperimentResult[]> {
    const results = await this.batch.runBatch(specs);
    this.lastComparison = this.batch.compareResults(results);
    return results;
  }

  async runParameterSweep(
    hypothesisId: string,
    sceneId: LabSceneId,
  ): Promise<{ results: ExperimentResult[]; comparison: ExperimentComparison }> {
    const jumpForces = [10, 11, 12, 13, 14];
    const gravities = [20, 22, 24, 26];
    const specs = this.batch.generateParameterGrid(hypothesisId, sceneId, jumpForces, gravities);
    const results = await this.runBatch(specs);
    return { results, comparison: this.lastComparison! };
  }

  async runFalsification(hypothesisId: string, sceneId: LabSceneId) {
    const results = await this.falsification.runAllForHypothesis(this.hypotheses, hypothesisId, sceneId);
    this.falsResults = results.map((r) => ({
      id: r.falsifierId,
      passed: r.passed,
      scenario: r.scenario,
    }));
    return results;
  }

  async runFalsificationScenario(scenario: FalsificationScenario, sceneId: LabSceneId) {
    return this.falsification.runScenario(scenario, sceneId);
  }

  tuneParameters(
    hypothesisId: string,
    sceneId: LabSceneId,
    overrides: ExperimentSpec['movementOverrides'],
  ) {
    return this.tuning.applyAndRerun(hypothesisId, sceneId, overrides);
  }

  exportReport(): LabReport {
    return this.sandbox.exportReport(this.telemetry.getFrames());
  }

  async verifyDeterminism(sceneId: LabSceneId, seed: number, ticks = 120): Promise<boolean> {
    const inputs = forwardJumpSequence(ticks);
    const replay: import('./types').ReplayFile = {
      version: 1,
      seed,
      sceneId,
      fixedDt: FIXED_DT,
      movementConfig: {},
      frames: inputs,
    };

    const a = await this.replayPlayer.play(new MovementSandbox(), replay);
    const b = await this.replayPlayer.play(new MovementSandbox(), replay);
    const cmp = this.replayPlayer.compare(a, b);
    this.determinismPass = cmp.hashMatch && cmp.maxPositionDelta < 0.01;
    return this.determinismPass;
  }

  getDashboardState(): ResearchDashboardState {
    const hyp = this.hypotheses.list();
    const evd = this.evidence.list();
    const readiness = this.readiness.estimate({
      hypotheses: hyp,
      evidence: evd,
      determinismPass: this.determinismPass,
      labBootMs: this.bootMs,
      falsificationComplete: this.falsResults.length > 0,
      reslogEntries: evd.length,
      phase17Live: true,
    });

    const h = hyp[0];
    const priorWidth = h ? h.ciHigh - h.ciLow : 1;
    const infoGain = this.batch.estimateInformationGain(priorWidth, priorWidth * 0.7);

    return {
      hypotheses: hyp,
      activeExperiments: [],
      readiness,
      latestComparison: this.lastComparison,
      telemetrySeries: this.telemetry.getSeries('velocity').map((p) => ({
        tick: p.tick,
        value: p.value,
        label: 'velocity.y',
      })),
      falsificationStatus: this.falsResults,
      informationGain: infoGain,
      uncertainty: h ? h.ciHigh - h.ciLow : 1,
    };
  }

  getHypotheses(): HypothesisRegistry {
    return this.hypotheses;
  }

  getEvidence(): EvidenceArtifact[] {
    return this.evidence.list();
  }

  getExplainable(): ExplainableBundle[] {
    return this.explain.list();
  }

  getSceneIds(): LabSceneId[] {
    return LAB_SCENE_IDS;
  }

  getStats(): StatisticalValidator {
    return this.stats;
  }

  dispose(): void {
    this.sandbox.dispose();
    this.runner.dispose();
    this.falsification.dispose();
  }
}

export { hashPositions, forwardJumpSequence, createJumpExperiment, LAB_SCENE_IDS };
