import { describe, it, expect } from 'vitest';
import { BayesianUpdater } from './BayesianUpdater';

describe('BayesianUpdater', () => {
  it('increases posterior on success observation', () => {
    const b = new BayesianUpdater();
    const post = b.update(0.5, 1, 0.05);
    expect(post.mean).toBeGreaterThan(0.5);
    expect(post.ciLow).toBeGreaterThanOrEqual(0);
    expect(post.ciHigh).toBeLessThanOrEqual(1);
  });

  it('decreases posterior on failure observation', () => {
    const b = new BayesianUpdater();
    const post = b.update(0.5, 0, 0.05);
    expect(post.mean).toBeLessThan(0.5);
  });

  it('tracks history', () => {
    const b = new BayesianUpdater();
    b.update(0.5, 1);
    b.update(0.6, 0);
    expect(b.getHistory()).toHaveLength(2);
    expect(b.getLatest()?.mean).toBeDefined();
  });
});
