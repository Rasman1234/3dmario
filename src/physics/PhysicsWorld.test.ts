import { describe, it, expect } from 'vitest';
import { PhysicsWorld } from './PhysicsWorld';

describe('PhysicsWorld', () => {
  it('creates persistent character controller', async () => {
    const pw = await PhysicsWorld.create({ x: 0, y: -24, z: 0 });
    pw.createKinematicCharacter('player', { x: 0, y: 2, z: 0 }, 0.4, 1.6);
    expect(pw.characterControllerCount).toBe(1);

    pw.createKinematicCharacter('player', { x: 1, y: 3, z: 1 }, 0.4, 1.6);
    expect(pw.characterControllerCount).toBe(1);

    pw.dispose();
  });

  it('steps simulation without throw', async () => {
    const pw = await PhysicsWorld.create({ x: 0, y: -24, z: 0 });
    pw.createGround('ground');
    pw.createKinematicCharacter('player', { x: 0, y: 3, z: 0 }, 0.4, 1.6);
    pw.moveCharacter('player', { x: 0, y: -0.1, z: 0 });
    pw.step(1 / 60);
    const pos = pw.getPosition('player');
    expect(pos.y).toBeLessThanOrEqual(3);
    pw.dispose();
  });

  it('moveCharacter returns grounded on floor', async () => {
    const pw = await PhysicsWorld.create({ x: 0, y: -24, z: 0 });
    pw.createGround('ground');
    pw.createKinematicCharacter('player', { x: 0, y: 3, z: 0 }, 0.4, 1.6);

    let grounded = false;
    for (let i = 0; i < 120; i++) {
      const result = pw.moveCharacter('player', { x: 0, y: -0.15, z: 0 });
      pw.step(1 / 60);
      grounded = result.grounded;
      if (grounded) break;
    }

    expect(grounded).toBe(true);
    pw.dispose();
  });
});
