import type { EventBus } from '../infrastructure/EventBus';
import { PowerUpType } from './PowerUpType';
import { Time } from '../core/Time';
import powerupConfig from '../data/powerups.json';

interface ActivePowerUp {
  type: PowerUpType;
  timer: number;
  config: Record<string, unknown>;
}

/** Manages active power-up effects with timers and event emission. */

export class PowerUpManager {
  private readonly active = new Map<PowerUpType, ActivePowerUp>();
  private speedMultiplier = 1;
  private damageMultiplier = 1;
  private invincible = false;
  private magnetRadius = 0;
  private coinMultiplier = 1;

  constructor(private readonly events: EventBus) {}

  collect(type: PowerUpType): void {
    const cfg = (powerupConfig as Record<string, Record<string, unknown>>)[type];
    if (!cfg) return;

    const duration = (cfg.duration as number) ?? 0;
    if (duration > 0) {
      this.active.set(type, { type, timer: duration, config: cfg });
    }

    this.applyEffect(type, cfg);
    this.events.emit('powerup:collected', { type, duration });
    this.events.emit('audio:play_sfx', { id: 'powerup' });
  }

  update(dt: number): void {
    for (const [type, pu] of this.active) {
      pu.timer -= dt;
      if (pu.timer <= 0) {
        this.active.delete(type);
        this.removeEffect(type, pu.config);
      }
    }
  }

  private applyEffect(type: PowerUpType, cfg: Record<string, unknown>): void {
    switch (type) {
      case PowerUpType.Speed:
        this.speedMultiplier = (cfg.speedMultiplier as number) ?? 1.8;
        break;
      case PowerUpType.Star:
        this.invincible = true;
        break;
      case PowerUpType.Magnet:
        this.magnetRadius = (cfg.radius as number) ?? 8;
        break;
      case PowerUpType.DoubleCoins:
        this.coinMultiplier = (cfg.multiplier as number) ?? 2;
        break;
      case PowerUpType.TimeSlow:
        Time.scale = (cfg.timeScale as number) ?? 0.3;
        break;
      case PowerUpType.Fire:
      case PowerUpType.Hammer:
      case PowerUpType.Giant:
        this.damageMultiplier = (cfg.damageMultiplier as number) ?? 2;
        break;
    }
  }

  private removeEffect(type: PowerUpType, _cfg: Record<string, unknown>): void {
    switch (type) {
      case PowerUpType.Speed: this.speedMultiplier = 1; break;
      case PowerUpType.Star: this.invincible = false; break;
      case PowerUpType.Magnet: this.magnetRadius = 0; break;
      case PowerUpType.DoubleCoins: this.coinMultiplier = 1; break;
      case PowerUpType.TimeSlow: Time.scale = 1; break;
      case PowerUpType.Fire:
      case PowerUpType.Hammer:
      case PowerUpType.Giant:
        this.damageMultiplier = 1;
        break;
    }
  }

  get isInvincible(): boolean { return this.invincible; }
  get speedMult(): number { return this.speedMultiplier; }
  get damageMult(): number { return this.damageMultiplier; }
  get magnetRange(): number { return this.magnetRadius; }
  get coinMult(): number { return this.coinMultiplier; }
  get activeCount(): number { return this.active.size; }
}
