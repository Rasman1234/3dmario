import { AttackType } from './AttackType';

const MULTIPLIERS: Record<AttackType, number> = {
  [AttackType.Basic]: 1,
  [AttackType.Jump]: 1.5,
  [AttackType.GroundPound]: 2,
  [AttackType.Spin]: 1.2,
  [AttackType.Dash]: 1.3,
  [AttackType.Projectile]: 0.8,
  [AttackType.Charge]: 2.5,
};

export function calculateDamage(
  baseDamage: number,
  attackType: AttackType,
  defense: number,
  comboMultiplier = 1,
): number {
  const raw = baseDamage * MULTIPLIERS[attackType] * comboMultiplier;
  return Math.max(1, Math.round(raw - defense * 0.5));
}

export function calculateKnockback(attackType: AttackType, combo = 0): number {
  const base = { basic: 3, jump: 5, ground_pound: 8, spin: 4, dash: 6, projectile: 2, charge: 10 }[attackType] ?? 3;
  return base + combo * 0.5;
}
