import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateKnockback } from './DamageCalculator';
import { AttackType } from './AttackType';

describe('DamageCalculator', () => {
  it('calculates basic damage', () => {
    expect(calculateDamage(1, AttackType.Basic, 0)).toBe(1);
  });

  it('ground pound deals more damage', () => {
    const gp = calculateDamage(1, AttackType.GroundPound, 0);
    const basic = calculateDamage(1, AttackType.Basic, 0);
    expect(gp).toBeGreaterThan(basic);
  });

  it('combo multiplier increases damage', () => {
    const x1 = calculateDamage(2, AttackType.Basic, 0, 1);
    const x3 = calculateDamage(2, AttackType.Basic, 0, 3);
    expect(x3).toBeGreaterThan(x1);
  });

  it('knockback scales with attack type', () => {
    expect(calculateKnockback(AttackType.GroundPound)).toBeGreaterThan(calculateKnockback(AttackType.Basic));
  });
});
