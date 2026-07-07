import { describe, it, expect } from 'vitest';
import { MovementController } from './MovementController';
import { CharacterFeelSystem } from './feel/CharacterFeelSystem';
import { MovementState } from './MovementState';

describe('MovementController feel integration', () => {
  it('uses curved movement when feel system attached', () => {
    const mc = new MovementController();
    const feel = new CharacterFeelSystem(mc);
    mc.feelSystem = feel;
    mc.setGrounded(true);
    mc.update(1 / 240, 1, 0, false, false, false, false, false);
    expect(mc.velocity.x).toBeGreaterThan(0);
    expect(mc.state).not.toBe(MovementState.Idle);
  });

  it('applies fast fall gravity multiplier when crouching airborne', () => {
    const mc = new MovementController();
    const feel = new CharacterFeelSystem(mc);
    mc.feelSystem = feel;
    mc.setGrounded(false);
    mc.velocity.y = -10;
    const base = mc.velocity.y;
    mc.update(1 / 240, 0, 0, false, false, false, true, false);
    expect(mc.velocity.y).toBeLessThan(base);
  });
});
