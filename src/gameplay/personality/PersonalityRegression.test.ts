import { describe, it, expect } from 'vitest';
import { PersonalityRegression } from './PersonalityRegression';

describe('PersonalityRegression', () => {
  it('passes when metrics meet golden baseline', () => {
    const r = new PersonalityRegression();
    const result = r.evaluate({
      animationTiming: { land: 0.1 },
      avgJumpRating: 0.75,
      expressionAvg: 0.75,
      playerRating: 4.5,
    });
    expect(result.passed).toBe(true);
  });

  it('rejects animation timing drift', () => {
    const r = new PersonalityRegression();
    const result = r.evaluate({
      animationTiming: { land: 0.2 },
      avgJumpRating: 0.5,
      expressionAvg: 0.4,
      playerRating: 3,
    });
    expect(result.passed).toBe(false);
  });
});
