import type { Vec3, LevelId } from '../domain/types';
import type { EventBus } from '../infrastructure/EventBus';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { EnemyAI } from '../ai/EnemyAI';
import type { CollectibleManager } from '../items/CollectibleManager';
import { EnemyType } from '../ai/BehaviorState';
import { CollectibleType } from '../items/CollectibleType';
import levelData from '../data/levels/grassland_01.json';

export interface LevelConfig {
  id: string;
  worldId: string;
  name: string;
  spawn: Vec3;
  platforms: { pos: Vec3; size: Vec3; type: string }[];
  enemies: { id: string; type: string; pos: Vec3; patrolRadius: number }[];
  collectibles: { id: string; type: string; pos: Vec3 }[];
  checkpoints: Vec3[];
  hasBoss: boolean;
}

/** Level loading, checkpoints, and entity spawning. */

export class LevelManager {
  private config: LevelConfig | null = null;
  private checkpointIndex = 0;
  private levelTime = 0;

  constructor(private readonly events: EventBus) {}

  async load(levelId: LevelId, physics: PhysicsWorld, enemyAI: EnemyAI, collectibles: CollectibleManager): Promise<LevelConfig> {
    this.config = levelData as LevelConfig;
    this.checkpointIndex = 0;
    this.levelTime = 0;

    physics.createGround('ground', 0);

    for (const [i, plat] of this.config.platforms.entries()) {
      physics.createStaticBox(`plat_${i}`, plat.pos, {
        x: plat.size.x / 2,
        y: plat.size.y / 2,
        z: plat.size.z / 2,
      });
    }

    for (const e of this.config.enemies) {
      enemyAI.spawn(e.id, e.type as EnemyType, e.pos, e.patrolRadius);
    }

    for (const c of this.config.collectibles) {
      collectibles.spawn(c.id, c.type as CollectibleType, c.pos);
    }

    this.events.emit('level:loaded', { levelId });
    return this.config;
  }

  getSpawn(): Vec3 {
    return this.config?.spawn ?? { x: 0, y: 2, z: 0 };
  }

  getCheckpoint(): Vec3 {
    const cps = this.config?.checkpoints ?? [];
    return cps[this.checkpointIndex] ?? this.getSpawn();
  }

  getCheckpointIndex(): number {
    return this.checkpointIndex;
  }

  activateCheckpoint(index: number): void {
    if (index <= this.checkpointIndex) return;
    this.checkpointIndex = index;
    this.events.emit('audio:play_sfx', { id: 'checkpoint' });
    this.events.emit('ui:toast', { message: `Checkpoint ${index + 1}`, duration: 2 });
  }

  /** Returns checkpoint index if player entered a new checkpoint volume. */
  probeCheckpoint(playerPos: Vec3, radius = 2.5): number | null {
    const cps = this.config?.checkpoints ?? [];
    for (let i = cps.length - 1; i >= 0; i--) {
      const cp = cps[i]!;
      const dx = playerPos.x - cp.x;
      const dz = playerPos.z - cp.z;
      const dy = Math.abs(playerPos.y - cp.y);
      if (Math.hypot(dx, dz) < radius && dy < 4 && i > this.checkpointIndex) {
        return i;
      }
    }
    return null;
  }

  respawnAtCheckpoint(): Vec3 {
    return this.getCheckpoint();
  }

  update(dt: number): void {
    this.levelTime += dt;
  }

  get time(): number {
    return this.levelTime;
  }

  get hasBoss(): boolean {
    return this.config?.hasBoss ?? false;
  }
}
