import { describe, it, expect } from 'vitest';
import { GameLoop } from './GameLoop';

describe('GameLoop 240/120', () => {
  it('runs simulation at fixedDt', () => {
    const loop = new GameLoop(1 / 240, 0.25, 120);
    expect(loop.fixedDt).toBeCloseTo(1 / 240);
    let updates = 0;
    loop.onUpdate(() => updates++);
    loop.stepOnce(1 / 60);
    expect(updates).toBeGreaterThanOrEqual(1);
  });
});
