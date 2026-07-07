import type { MovementConfig } from '../../gameplay/MovementController';
import type { ExperimentSpec } from '../types';
import { BayesianUpdater } from '../bayesian/BayesianUpdater';
import type { HypothesisRegistry } from '../experiments/HypothesisRegistry';
import type { ExperimentRunner } from '../experiments/ExperimentRunner';
import { createJumpExperiment } from '../experiments/ExperimentRunner';

/** Live parameter hot-reload — restarts experiment and updates beliefs. */

export class ParameterTuning {
  private readonly bayesian = new BayesianUpdater();

  constructor(
    private readonly runner: ExperimentRunner,
    private readonly hypotheses: HypothesisRegistry,
  ) {}

  async applyAndRerun(
    hypothesisId: string,
    sceneId: ExperimentSpec['sceneId'],
    overrides: Partial<MovementConfig>,
    seed = 42,
  ) {
    const hyp = this.hypotheses.get(hypothesisId);
    const prior = hyp?.posterior ?? 0.5;

    const spec = createJumpExperiment(hypothesisId, sceneId, overrides, seed);
    const result = await this.runner.run(spec);

    const post = this.bayesian.update(prior, result.passed ? 1 : 0, 0.12);
    if (hyp) {
      this.hypotheses.updatePosterior(hypothesisId, post.mean, post.ciLow, post.ciHigh);
    }

    return {
      result,
      posterior: post,
      overrides,
    };
  }
}
