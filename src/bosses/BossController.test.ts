import { describe, it, expect } from 'vitest';
import { BossController } from './BossController';

describe('BossController', () => {
  it('initializes with full health', () => {
    const boss = new BossController({ emit: () => {} } as never);
    boss.init({ id: 'b1', name: 'Test Boss', health: 30, phases: 3, position: { x: 0, y: 0, z: -30 } });
    expect(boss.hp).toBe(30);
    expect(boss.currentPhase).toBe(1);
  });

  it('takes damage and transitions phases', () => {
    const boss = new BossController({ emit: () => {} } as never);
    boss.init({ id: 'b1', name: 'Test Boss', health: 30, phases: 3, position: { x: 0, y: 0, z: -30 } });
    boss.takeDamage(15);
    expect(boss.currentPhase).toBeGreaterThanOrEqual(2);
  });

  it('defeats at zero health', () => {
    const boss = new BossController({ emit: () => {} } as never);
    boss.init({ id: 'b1', name: 'Test Boss', health: 10, phases: 2, position: { x: 0, y: 0, z: -30 } });
    boss.takeDamage(10);
    expect(boss.isDefeated).toBe(true);
  });
});
