import { describe, it, expect, afterEach } from 'vitest';
import { ResearchLab } from './ResearchLab';
import { createJumpExperiment } from './experiments/ExperimentRunner';

describe('ResearchLab (headless)', () => {
  let lab: ResearchLab;

  afterEach(() => {
    lab?.dispose();
  });

  it('boots and verifies determinism', async () => {
    lab = new ResearchLab();
    await lab.boot('jump_laboratory', 42);
    const ok = await lab.verifyDeterminism('jump_laboratory', 42, 120);
    expect(ok).toBe(true);
  });

  it('runs experiment from HYP and produces EVD + explainable bundle', async () => {
    lab = new ResearchLab();
    const spec = createJumpExperiment('HYP-M1-feel', 'gap_laboratory', { jumpForce: 12, gravity: 24 });
    await lab.runExperiment(spec);
    expect(lab.getEvidence().length).toBeGreaterThanOrEqual(1);
    expect(lab.getExplainable().length).toBeGreaterThanOrEqual(1);
    const state = lab.getDashboardState();
    expect(state.hypotheses[0].posterior).not.toBe(0.5);
  });

  it('runs parameter sweep and ranks presets', async () => {
    lab = new ResearchLab();
    const { results, comparison } = await lab.runParameterSweep('HYP-M1-feel', 'gap_laboratory');
    expect(results.length).toBeGreaterThanOrEqual(10);
    expect(comparison.ranking.length).toBe(results.length);
    expect(comparison.recommendation).toContain('Best preset');
  }, 60000);

  it('runs falsification scenarios', async () => {
    lab = new ResearchLab();
    const results = await lab.runFalsification('HYP-M1-feel', 'gap_laboratory');
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(lab.getDashboardState().falsificationStatus.length).toBe(results.length);
  }, 30000);
});
