import type { Vec3 } from '../domain/types';
import { BehaviorState, EnemyType } from './BehaviorState';
import { vec3Dist } from '../utils/Math';
import enemyConfig from '../data/enemies.json';

export interface EnemyConfig {
  health: number;
  speed: number;
  damage: number;
  detectionRadius: number;
  attackRadius: number;
  points: number;
}

export interface EnemyState {
  id: string;
  type: EnemyType;
  position: Vec3;
  patrolOrigin: Vec3;
  patrolRadius: number;
  health: number;
  maxHealth: number;
  behavior: BehaviorState;
  facingAngle: number;
  stunTimer: number;
  attackCooldown: number;
  alive: boolean;
}

/** State-machine driven enemy AI — patrol, chase, attack, retreat. */

export class EnemyAI {
  readonly enemies: EnemyState[] = [];

  spawn(id: string, type: EnemyType, position: Vec3, patrolRadius = 5): EnemyState {
    const cfg = (enemyConfig as Record<string, EnemyConfig>)[type];
    const enemy: EnemyState = {
      id,
      type,
      position: { ...position },
      patrolOrigin: { ...position },
      patrolRadius,
      health: cfg.health,
      maxHealth: cfg.health,
      behavior: BehaviorState.Patrol,
      facingAngle: 0,
      stunTimer: 0,
      attackCooldown: 0,
      alive: true,
    };
    this.enemies.push(enemy);
    return enemy;
  }

  update(dt: number, playerPos: Vec3): { attacks: { enemyId: string; damage: number }[] } {
    const attacks: { enemyId: string; damage: number }[] = [];

    for (const e of this.enemies) {
      if (!e.alive) continue;
      const cfg = (enemyConfig as Record<string, EnemyConfig>)[e.type];
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        e.behavior = BehaviorState.Stunned;
        continue;
      }
      if (e.attackCooldown > 0) e.attackCooldown -= dt;

      const dist = vec3Dist(e.position, playerPos);

      if (e.behavior === BehaviorState.Sleep) {
        if (dist < cfg.detectionRadius) e.behavior = BehaviorState.Chase;
        continue;
      }

      if (dist > cfg.detectionRadius * 1.5) {
        e.behavior = BehaviorState.Patrol;
      } else if (dist < cfg.attackRadius && e.attackCooldown <= 0) {
        e.behavior = BehaviorState.Attack;
        attacks.push({ enemyId: e.id, damage: cfg.damage });
        e.attackCooldown = 1.0;
      } else if (dist < cfg.detectionRadius) {
        e.behavior = BehaviorState.Chase;
      }

      switch (e.behavior) {
        case BehaviorState.Patrol:
          this.patrol(e, cfg.speed * 0.5, dt);
          break;
        case BehaviorState.Chase:
          this.chase(e, playerPos, cfg.speed, dt);
          break;
        case BehaviorState.Retreat:
          this.retreat(e, playerPos, cfg.speed, dt);
          break;
      }
    }

    return { attacks };
  }

  damage(id: string, amount: number): boolean {
    const e = this.enemies.find((en) => en.id === id);
    if (!e || !e.alive) return false;
    e.health -= amount;
    e.stunTimer = 0.3;
    if (e.health <= 0) {
      e.alive = false;
      e.behavior = BehaviorState.Dead;
      return true;
    }
    e.behavior = BehaviorState.Retreat;
    return false;
  }

  private patrol(e: EnemyState, speed: number, dt: number): void {
    const t = Date.now() * 0.001;
    const angle = t * 0.5 + parseFloat(e.id) * 0.3;
    const tx = e.patrolOrigin.x + Math.sin(angle) * e.patrolRadius;
    const tz = e.patrolOrigin.z + Math.cos(angle) * e.patrolRadius;
    this.moveToward(e, { x: tx, y: e.position.y, z: tz }, speed, dt);
  }

  private chase(e: EnemyState, target: Vec3, speed: number, dt: number): void {
    this.moveToward(e, target, speed, dt);
  }

  private retreat(e: EnemyState, from: Vec3, speed: number, dt: number): void {
    const dx = e.position.x - from.x;
    const dz = e.position.z - from.z;
    const len = Math.hypot(dx, dz) || 1;
    this.moveToward(e, { x: e.position.x + (dx / len) * 3, y: e.position.y, z: e.position.z + (dz / len) * 3 }, speed, dt);
    if (vec3Dist(e.position, e.patrolOrigin) < 1) e.behavior = BehaviorState.Patrol;
  }

  private moveToward(e: EnemyState, target: Vec3, speed: number, dt: number): void {
    const dx = target.x - e.position.x;
    const dz = target.z - e.position.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) return;
    e.facingAngle = Math.atan2(dx, dz);
    e.position.x += (dx / len) * speed * dt;
    e.position.z += (dz / len) * speed * dt;
  }

  get aliveCount(): number {
    return this.enemies.filter((e) => e.alive).length;
  }
}
