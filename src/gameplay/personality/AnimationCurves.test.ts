import { describe, it, expect } from 'vitest';
import { evaluateAnimCurve, phaseProgress } from './AnimationCurves';

describe('AnimationCurves', () => {
  it('evaluates expressive curves', () => {
    expect(evaluateAnimCurve('ease_in', 0.5)).toBeGreaterThan(0);
    expect(evaluateAnimCurve('bounce', 0.5)).toBeGreaterThan(0);
  });

  it('computes phase progress', () => {
    expect(phaseProgress(0.05, { duration: 0.1, curve: 'linear' })).toBeCloseTo(0.5);
  });
});
