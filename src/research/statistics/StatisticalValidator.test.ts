import { describe, it, expect } from 'vitest';
import { StatisticalValidator } from './StatisticalValidator';

describe('StatisticalValidator', () => {
  const stats = new StatisticalValidator();

  it('computes mean and variance', () => {
    expect(stats.mean([2, 4, 6])).toBe(4);
    expect(stats.variance([2, 4, 6])).toBe(4);
  });

  it('computes confidence interval', () => {
    const ci = stats.confidenceInterval([0.5, 0.6, 0.7, 0.55]);
    expect(ci[0]).toBeLessThan(ci[1]);
  });

  it('computes required sample size', () => {
    expect(stats.requiredSampleSize(0.5)).toBeGreaterThan(10);
  });

  it('measures repeatability of hashes', () => {
    expect(stats.repeatability(['a', 'a', 'a'])).toBe(1);
    expect(stats.repeatability(['a', 'b'])).toBe(0.5);
  });
});
