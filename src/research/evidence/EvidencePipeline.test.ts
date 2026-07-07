import { describe, it, expect } from 'vitest';
import { EvidencePipeline } from './EvidencePipeline';

describe('EvidencePipeline', () => {
  it('generates EVD artifacts without manual editing', () => {
    const pipeline = new EvidencePipeline();
    const evd = pipeline.generate({
      hypothesisId: 'HYP-M1-feel',
      experimentId: 'EXP-1',
      metrics: {
        jumpCount: 3,
        jumpSuccessRate: 0.67,
        missedJumpRate: 0.33,
        avgLandingVelocity: 2,
        maxJumpApex: 8,
        deathCount: 0,
        recoveryCount: 0,
        completionTime: 4,
        groundedPercent: 0.8,
      },
      posterior: 0.62,
      ciLow: 0.5,
      ciHigh: 0.74,
      conclusion: 'supported',
    });

    expect(evd.id).toMatch(/^EVD-/);
    expect(evd.rawSummary).toContain('jumpSuccess=0.670');
    expect(pipeline.list()).toHaveLength(1);
    expect(JSON.parse(pipeline.exportJson())).toHaveLength(1);
  });
});
