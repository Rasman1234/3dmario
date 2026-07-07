import type { Vec3 } from '../domain/types';
import type { EventBus } from '../infrastructure/EventBus';
import { CollectibleType } from './CollectibleType';
import { vec3Dist } from '../utils/Math';

export interface CollectibleInstance {
  id: string;
  type: CollectibleType;
  position: Vec3;
  value: number;
  collected: boolean;
}

const VALUES: Record<CollectibleType, number> = {
  [CollectibleType.Coin]: 1,
  [CollectibleType.GoldenCoin]: 10,
  [CollectibleType.Star]: 0,
  [CollectibleType.Gem]: 50,
  [CollectibleType.Crystal]: 25,
  [CollectibleType.Key]: 0,
  [CollectibleType.Artifact]: 100,
};

/** Spawns, tracks, and resolves collectible pickups with magnet support. */

export class CollectibleManager {
  readonly items: CollectibleInstance[] = [];
  totalCoins = 0;
  totalStars = 0;

  constructor(private readonly events: EventBus) {}

  spawn(id: string, type: CollectibleType, position: Vec3, value?: number): void {
    this.items.push({
      id,
      type,
      position: { ...position },
      value: value ?? VALUES[type],
      collected: false,
    });
  }

  update(playerPos: Vec3, magnetRadius: number, dt: number): void {
    for (const item of this.items) {
      if (item.collected) continue;
      const dist = vec3Dist(playerPos, item.position);
      if (magnetRadius > 0 && dist < magnetRadius && dist > 0.5) {
        const pull = 8 * dt;
        const dx = playerPos.x - item.position.x;
        const dz = playerPos.z - item.position.z;
        const len = Math.hypot(dx, dz) || 1;
        item.position.x += (dx / len) * pull;
        item.position.z += (dz / len) * pull;
      }
      if (dist < 1.2) this.collect(item);
    }
  }

  private collect(item: CollectibleInstance): void {
    item.collected = true;
    if (item.type === CollectibleType.Coin || item.type === CollectibleType.GoldenCoin) {
      this.totalCoins += item.value;
      this.events.emit('coin:collected', { value: item.value, position: item.position, total: this.totalCoins });
      this.events.emit('audio:play_sfx', { id: 'coin' });
    } else if (item.type === CollectibleType.Star) {
      this.totalStars++;
      this.events.emit('star:collected', { levelId: 'current', index: this.totalStars });
      this.events.emit('audio:play_sfx', { id: 'star' });
    } else {
      this.events.emit('item:pickup', { itemId: item.id });
    }
  }

  get remaining(): number {
    return this.items.filter((i) => !i.collected).length;
  }
}
