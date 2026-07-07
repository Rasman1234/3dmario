import { describe, it, expect } from 'vitest';
import { MovementController } from './MovementController';
import { MovementState } from './MovementState';

describe('MovementController physicsDriven', () => {
  it('does not integrate position when physicsDriven', () => {
    const mc = new MovementController();
    mc.physicsDriven = true;
    mc.velocity = { x: 10, y: 5, z: 10 };
    mc.setGrounded(true);
    const startPos = { ...mc.position };
    mc.update(1, 1, 0, false, false, false, false, false);
    expect(mc.position).toEqual(startPos);
  });

  it('integrates position when not physicsDriven', () => {
    const mc = new MovementController();
    mc.physicsDriven = false;
    mc.setGrounded(true);
    mc.update(0.1, 1, 0, false, false, false, false, false);
    expect(mc.position.x).not.toBe(0);
  });

  it('applyGroundingTransition triggers land state', () => {
    const mc = new MovementController();
    mc.velocity.y = -2;
    mc.applyGroundingTransition(false, true);
    expect(mc.state).toBe(MovementState.Land);
  });

  it('syncPositionFromPhysics updates position', () => {
    const mc = new MovementController();
    mc.syncPositionFromPhysics({ x: 5, y: 10, z: -3 });
    expect(mc.position).toEqual({ x: 5, y: 10, z: -3 });
  });
});
