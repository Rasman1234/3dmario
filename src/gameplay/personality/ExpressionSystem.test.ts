import { describe, it, expect } from 'vitest';
import { ExpressionSystem } from './ExpressionSystem';
import { getActivePersonality } from './types';

describe('ExpressionSystem', () => {
  it('rewards perfect landing and chain jumps', () => {
    const expr = new ExpressionSystem(getActivePersonality());
    const land = expr.onLanding(0.9, 2);
    expect(land?.type).toBe('perfect_landing');
    expr.onLanding(0.9, 2);
    const chain = expr.onChainJump();
    expect(chain?.type).toBe('chain_jump');
  });

  it('detects long jumps', () => {
    const expr = new ExpressionSystem(getActivePersonality());
    const e = expr.onLongJump(4);
    expect(e?.type).toBe('long_jump');
  });
});
