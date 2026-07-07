import { describe, it, expect } from 'vitest';
import { ExperimentBatch } from './ExperimentBatch';
import { ExperimentRunner } from './ExperimentRunner';
import { HypothesisRegistry } from './HypothesisRegistry';
import { RESEARCH_BUDGETS } from '../types';

describe('ExperimentBatch', () => {
  const hypotheses = new HypothesisRegistry();
  hypotheses.register(HypothesisRegistry.createDefaultM1());
  const runner = new ExperimentRunner(hypotheses);
  const batch = new ExperimentBatch(runner);

  it('generates 100+ parameter combinations within budget', () => {
    const jumpForces = Array.from({ length: 11 }, (_, i) => 8 + i * 0.5);
    const gravities = Array.from({ length: 11 }, (_, i) => 18 + i);
    const specs = batch.generateParameterGrid('HYP-M1-feel', 'gap_laboratory', jumpForces, gravities);
    expect(specs.length).toBeGreaterThanOrEqual(100);
    expect(specs.length).toBeLessThanOrEqual(RESEARCH_BUDGETS.maxBatchSize);
  });

  it('estimates information gain from CI width reduction', () => {
    expect(batch.estimateInformationGain(0.3, 0.1)).toBeCloseTo(0.2);
    expect(batch.estimateInformationGain(0.2, 0.25)).toBe(0);
  });

  runner.dispose();
});
