import { describe, it, expect } from 'vitest';
import { MovementController } from './MovementController';
import { MovementState } from './MovementState';

describe('MovementController', () => {
  it('starts at idle on ground', () => {
    const mc = new MovementController();
    mc.setGrounded(true);
    mc.update(1 / 60, 0, 0, false, false, false, false, false);
    expect(mc.state).toBe(MovementState.Idle);
  });

  it('jumps when grounded', () => {
    const mc = new MovementController();
    mc.setGrounded(true);
    mc.update(1 / 60, 0, 0, true, true, false, false, false);
    expect(mc.velocity.y).toBeGreaterThan(0);
  });

  it('applies gravity when airborne', () => {
    const mc = new MovementController();
    mc.setGrounded(false);
    mc.velocity.y = 0;
    mc.update(1 / 60, 0, 0, false, false, false, false, false);
    expect(mc.velocity.y).toBeLessThan(0);
  });

  it('resets position', () => {
    const mc = new MovementController();
    mc.reset({ x: 5, y: 10, z: -3 });
    expect(mc.position).toEqual({ x: 5, y: 10, z: -3 });
  });
});
