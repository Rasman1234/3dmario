import type { ExperimentSpec, ExperimentResult, ExperimentComparison } from '../types';
import { RESEARCH_BUDGETS } from '../types';
import { ExperimentRunner, createJumpExperiment } from './ExperimentRunner';
import { StatisticalValidator } from '../statistics/StatisticalValidator';

/** Batch experiment automation — 100+ parameter combinations. */

export class ExperimentBatch {
  private readonly stats = new StatisticalValidator();

  constructor(private readonly runner: ExperimentRunner) {}

  generateParameterGrid(
    hypothesisId: string,
    sceneId: ExperimentSpec['sceneId'],
    jumpForces: number[],
    gravities: number[],
    seed = 42,
  ): ExperimentSpec[] {
    const specs: ExperimentSpec[] = [];
    for (const jumpForce of jumpForces) {
      for (const gravity of gravities) {
        specs.push(
          createJumpExperiment(hypothesisId, sceneId, { jumpForce, gravity }, seed),
        );
        if (specs.length >= RESEARCH_BUDGETS.maxBatchSize) return specs;
      }
    }
    return specs;
  }

  async runBatch(specs: ExperimentSpec[]): Promise<ExperimentResult[]> {
    const results: ExperimentResult[] = [];
    for (const spec of specs) {
      results.push(await this.runner.run(spec));
    }
    return results;
  }

  compareResults(results: ExperimentResult[]): ExperimentComparison {
    if (results.length < 2) {
      return {
        baselineId: results[0]?.spec.id ?? '',
        variantId: '',
        metricDeltas: {},
        effectSizes: {},
        confidenceIntervals: {},
        ranking: results.map((r) => r.spec.id),
        recommendation: 'Need at least 2 results for comparison',
      };
    }

    const baseline = results[0];
    const rates = results.map((r) => r.report.metrics.jumpSuccessRate);
    const ranking = [...results]
      .sort((a, b) => b.report.metrics.jumpSuccessRate - a.report.metrics.jumpSuccessRate)
      .map((r) => r.spec.id);

    const ci = this.stats.confidenceInterval(rates);
    const deltas: Record<string, number> = {};
    const effects: Record<string, number> = {};
    const cis: Record<string, [number, number]> = { jumpSuccessRate: ci };

    for (let i = 1; i < results.length; i++) {
      const d =
        results[i].report.metrics.jumpSuccessRate - baseline.report.metrics.jumpSuccessRate;
      deltas[results[i].spec.id] = d;
      effects[results[i].spec.id] = this.stats.cohensD(
        [baseline.report.metrics.jumpSuccessRate],
        [results[i].report.metrics.jumpSuccessRate],
      );
    }

    const best = results.find((r) => r.spec.id === ranking[0]);
    return {
      baselineId: baseline.spec.id,
      variantId: ranking[0],
      metricDeltas: deltas,
      effectSizes: effects,
      confidenceIntervals: cis,
      ranking,
      recommendation: `Best preset: jumpForce=${best?.spec.movementOverrides.jumpForce ?? 'default'} jumpSuccess=${best?.report.metrics.jumpSuccessRate.toFixed(2)}`,
    };
  }

  estimateInformationGain(priorWidth: number, expectedPosteriorWidth: number): number {
    return Math.max(0, priorWidth - expectedPosteriorWidth);
  }
}
