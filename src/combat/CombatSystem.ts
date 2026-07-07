import type { Vec3 } from '../domain/types';
import type { EventBus } from '../infrastructure/EventBus';
import { AttackType } from './AttackType';
import { calculateDamage, calculateKnockback } from './DamageCalculator';
import type { EnemyAI } from '../ai/EnemyAI';
import type { MovementController } from '../gameplay/MovementController';
import { vec3Dist } from '../utils/Math';

/** Combat system — combos, knockback, i-frames, damage resolution. */

export class CombatSystem {
  private comboCount = 0;
  private comboTimer = 0;
  private readonly comboWindow = 1.5;
  private attackCooldown = 0;
  private readonly attackRange = 2.5;

  constructor(
    private readonly events: EventBus,
    private readonly baseDamage = 1,
  ) {}

  update(dt: number): void {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.comboCount = 0;
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
  }

  attack(
    type: AttackType,
    playerPos: Vec3,
    facingAngle: number,
    enemyAI: EnemyAI,
    _movement: MovementController,
  ): number {
    if (this.attackCooldown > 0) return 0;
    this.attackCooldown = 0.3;
    this.comboCount++;
    this.comboTimer = this.comboWindow;

    const comboMult = 1 + (this.comboCount - 1) * 0.15;
    let hitCount = 0;

    for (const enemy of enemyAI.enemies) {
      if (!enemy.alive) continue;
      const dist = vec3Dist(playerPos, enemy.position);
      if (dist > this.attackRange) continue;

      const dmg = calculateDamage(this.baseDamage, type, 0, comboMult);
      const killed = enemyAI.damage(enemy.id, dmg);
      const kb = calculateKnockback(type, this.comboCount);
      const kbDir: Vec3 = {
        x: Math.sin(facingAngle) * kb,
        y: 0.5,
        z: Math.cos(facingAngle) * kb,
      };
      enemy.position.x += kbDir.x * 0.1;
      enemy.position.z += kbDir.z * 0.1;

      this.events.emit('attack:performed', { type, damage: dmg });
      if (killed) {
        this.events.emit('enemy:defeated', { enemyId: enemy.id, type: enemy.type });
        hitCount++;
      }
    }

    return hitCount;
  }

  processEnemyAttacks(
    attacks: { enemyId: string; damage: number }[],
    movement: MovementController,
    stats: { health: number; defense: number },
  ): number {
    if (movement.invincibleTimer > 0) return stats.health;
    let health = stats.health;
    for (const atk of attacks) {
      const dmg = Math.max(1, atk.damage - stats.defense);
      health -= dmg;
      movement.applyKnockback({ x: 0, y: 0.5, z: -1 }, 5);
      movement.invincibleTimer = 1.0;
      this.events.emit('player:damaged', { amount: dmg, remaining: health });
    }
    return health;
  }

  get combo(): number {
    return this.comboCount;
  }
}
