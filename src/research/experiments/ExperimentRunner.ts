import type { ExperimentSpec, ExperimentResult } from '../types';
import { MovementSandbox, forwardJumpSequence } from '../sandbox/MovementSandbox';
import { TelemetryCollector } from '../telemetry/TelemetryCollector';
import { ReplayRecorder } from '../replay/ReplayRecorder';
import { BayesianUpdater } from '../bayesian/BayesianUpdater';
import { EvidencePipeline } from '../evidence/EvidencePipeline';
import { ExplainableResults } from '../evidence/ExplainableResults';
import type { HypothesisRegistry } from './HypothesisRegistry';

let experimentCounter = 0;

function nextExperimentId(): string {
  experimentCounter++;
  return `EXP-${Date.now()}-${experimentCounter}`;
}

/** Execute a single research experiment from HYP/spec. */

export class ExperimentRunner {
  private readonly sandbox = new MovementSandbox();
  private readonly telemetry = new TelemetryCollector();
  private readonly replay = new ReplayRecorder();
  private readonly bayesian = new BayesianUpdater();

  constructor(
    private readonly hypotheses: HypothesisRegistry,
    private readonly evidence = new EvidencePipeline(),
    private readonly explain = new ExplainableResults(),
  ) {}

  async run(
    spec: ExperimentSpec,
  ): Promise<ExperimentResult & { evdId: string; xplId: string }> {
    const start = performance.now();
    await this.sandbox.init();
    this.sandbox.setSeed(spec.seed);
    await this.sandbox.loadSceneAsync(spec.sceneId, spec.movementOverrides);

    this.replay.start(spec.seed, spec.sceneId, spec.movementOverrides);
    const inputs = spec.inputSequence;
    const { frames, metrics } = this.sandbox.runSequence(inputs, spec.durationTicks);
    for (const input of inputs.slice(0, frames.length)) {
      this.replay.recordInput(input);
    }
    this.replay.stop();

    this.telemetry.recordBatch(frames);
    const report = this.sandbox.exportReport(frames);
    const hyp = this.hypotheses.get(spec.hypothesisId);

    let passed = true;
    if (hyp) {
      const rate = metrics.jumpSuccessRate;
      const success = rate >= 0.5;
      const post = this.bayesian.update(hyp.posterior, success ? 1 : 0, 0.15);
      this.hypotheses.updatePosterior(spec.hypothesisId, post.mean, post.ciLow, post.ciHigh);
      this.hypotheses.addExperiment(spec.hypothesisId, spec.id);
      passed = hyp.targetDirection === 'increase' ? rate >= 0.5 : rate <= 0.5;
    }

    const updatedHyp = this.hypotheses.get(spec.hypothesisId);

    const evd = this.evidence.generate({
      hypothesisId: spec.hypothesisId,
      experimentId: spec.id,
      metrics,
      posterior: updatedHyp?.posterior ?? 0.5,
      ciLow: updatedHyp?.ciLow ?? 0,
      ciHigh: updatedHyp?.ciHigh ?? 1,
      conclusion: passed ? 'supported' : 'inconclusive',
    });

    const xpl = this.explain.build({
      experimentId: spec.id,
      hypothesis: updatedHyp?.statement ?? spec.hypothesisId,
      evidence: [evd.rawSummary],
      alternatives: updatedHyp?.alternatives ?? [],
      confidenceBefore: updatedHyp?.prior ?? 0.5,
      confidenceAfter: updatedHyp?.posterior ?? 0.5,
      ci: [updatedHyp?.ciLow ?? 0, updatedHyp?.ciHigh ?? 1] as [number, number],
      recommendation: passed
        ? 'Continue tuning toward higher jump success'
        : 'Revise movement parameters or gap spacing',
    });

    return {
      spec,
      report,
      telemetry: frames,
      durationMs: performance.now() - start,
      passed,
      evdId: evd.id,
      xplId: xpl.id,
    };
  }

  getTelemetry(): TelemetryCollector {
    return this.telemetry;
  }

  getSandbox(): MovementSandbox {
    return this.sandbox;
  }

  dispose(): void {
    this.sandbox.dispose();
  }
}

export function createJumpExperiment(
  hypothesisId: string,
  sceneId: ExperimentSpec['sceneId'],
  overrides: ExperimentSpec['movementOverrides'] = {},
  seed = 42,
): ExperimentSpec {
  return {
    id: nextExperimentId(),
    hypothesisId,
    sceneId,
    seed,
    durationTicks: 240,
    movementOverrides: overrides,
    inputSequence: forwardJumpSequence(240),
  };
}
