import { describe, it, expect } from 'vitest';
import { evaluateCurve, curveMoveToward } from './MovementCurves';

describe('MovementCurves', () => {
  const shape = { start: 0.5, peak: 1.0, end: 0.5 };

  it('evaluates curve at boundaries', () => {
    expect(evaluateCurve(shape, 0)).toBeCloseTo(0.5);
    expect(evaluateCurve(shape, 0.5)).toBeCloseTo(1.0);
    expect(evaluateCurve(shape, 1)).toBeCloseTo(0.5);
  });

  it('moves toward target with curve scaling', () => {
    const next = curveMoveToward(0, 10, 10, 0.1, shape);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThanOrEqual(10);
  });
});
