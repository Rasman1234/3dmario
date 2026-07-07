import { describe, it, expect } from 'vitest';
import { EnemyAI } from './EnemyAI';
import { EnemyType } from './BehaviorState';

describe('EnemyAI', () => {
  it('spawns enemies', () => {
    const ai = new EnemyAI();
    ai.spawn('1', EnemyType.Walker, { x: 0, y: 0, z: 0 });
    expect(ai.enemies).toHaveLength(1);
    expect(ai.aliveCount).toBe(1);
  });

  it('patrols when player is far', () => {
    const ai = new EnemyAI();
    ai.spawn('1', EnemyType.Walker, { x: 0, y: 0, z: 0 });
    const startX = ai.enemies[0]!.position.x;
    ai.update(1, { x: 100, y: 0, z: 100 });
    expect(ai.enemies[0]!.position.x).not.toBe(startX);
  });

  it('kills enemy on fatal damage', () => {
    const ai = new EnemyAI();
    ai.spawn('1', EnemyType.Walker, { x: 0, y: 0, z: 0 });
    const killed = ai.damage('1', 99);
    expect(killed).toBe(true);
    expect(ai.aliveCount).toBe(0);
  });
});
