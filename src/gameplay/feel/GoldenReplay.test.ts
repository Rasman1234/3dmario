import { describe, it, expect } from 'vitest';
import { compareToGolden, GOLDEN_REPLAY } from './GoldenReplay';

describe('GoldenReplay', () => {
  it('matches golden hash', () => {
    const result = compareToGolden(GOLDEN_REPLAY.positionHash, GOLDEN_REPLAY.metrics);
    expect(result.hashMatch).toBe(true);
    expect(result.pass).toBe(true);
  });

  it('detects metric regression', () => {
    const result = compareToGolden('wrong-hash', {
      jumpSuccessRate: 0.2,
      avgLandingVelocity: 10,
      maxJumpApex: 1,
    });
    expect(result.pass).toBe(false);
  });
});
