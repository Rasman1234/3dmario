import type { Vec3 } from '../domain/types';
import type { EventBus } from '../infrastructure/EventBus';
import { vec3Dist } from '../utils/Math';

export interface BossConfig {
  id: string;
  name: string;
  health: number;
  phases: number;
  position: Vec3;
}

export enum BossAttack {
  Slam = 'slam',
  Charge = 'charge',
  Projectile = 'projectile',
  Summon = 'summon',
  Rage = 'rage',
}

/** Multi-phase boss AI with weak points, pattern attacks, and rage mode. */

export class BossController {
  private config: BossConfig | null = null;
  private health = 0;
  private maxHealth = 0;
  private phase = 1;
  private attackTimer = 0;
  private attackCooldown = 2;
  private rageMode = false;
  private defeated = false;
  private readonly attackPatterns: BossAttack[] = [
    BossAttack.Slam,
    BossAttack.Charge,
    BossAttack.Projectile,
    BossAttack.Summon,
  ];
  private patternIndex = 0;

  constructor(private readonly events: EventBus) {}

  init(config: BossConfig): void {
    this.config = config;
    this.health = config.health;
    this.maxHealth = config.health;
    this.phase = 1;
    this.defeated = false;
    this.rageMode = false;
    this.events.emit('boss:phase_changed', { bossId: config.id, phase: 1 });
  }

  update(dt: number, playerPos: Vec3): { damage: number; attack: BossAttack | null } {
    if (!this.config || this.defeated) return { damage: 0, attack: null };

    this.attackTimer -= dt;
    if (this.attackTimer > 0) return { damage: 0, attack: null };

    const dist = vec3Dist(this.config.position, playerPos);
    const attack = this.attackPatterns[this.patternIndex % this.attackPatterns.length]!;
    this.patternIndex++;
    this.attackTimer = this.rageMode ? this.attackCooldown * 0.5 : this.attackCooldown;

    let damage = 0;
    if (attack === BossAttack.Slam && dist < 5) damage = 2;
    if (attack === BossAttack.Charge && dist < 8) damage = 1;
    if (attack === BossAttack.Projectile && dist < 15) damage = 1;

    this.events.emit('camera:shake', { intensity: 0.3, duration: 0.2 });
    return { damage, attack };
  }

  takeDamage(amount: number): void {
    if (!this.config || this.defeated) return;
    this.health -= amount;

    const phaseThreshold = this.maxHealth / this.config.phases;
    const newPhase = Math.min(this.config.phases, Math.ceil((this.maxHealth - this.health) / phaseThreshold) + 1);
    if (newPhase > this.phase) {
      this.phase = newPhase;
      this.events.emit('boss:phase_changed', { bossId: this.config.id, phase: newPhase });
      if (newPhase === this.config.phases) {
        this.rageMode = true;
        this.attackCooldown = 1;
      }
    }

    if (this.health <= 0) {
      this.defeated = true;
      this.events.emit('boss:defeated', { bossId: this.config.id });
      this.events.emit('camera:shake', { intensity: 0.5, duration: 0.5 });
    }
  }

  get hp(): number { return this.health; }
  get maxHp(): number { return this.maxHealth; }
  get currentPhase(): number { return this.phase; }
  get name(): string { return this.config?.name ?? ''; }
  get isDefeated(): boolean { return this.defeated; }
  get position(): Vec3 { return this.config?.position ?? { x: 0, y: 0, z: 0 }; }
}
