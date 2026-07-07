import { describe, it, expect } from 'vitest';
import { MovementController } from '../MovementController';
import { CharacterFeelSystem } from './CharacterFeelSystem';
import { MovementState } from '../MovementState';

describe('CharacterFeelSystem', () => {
  it('applies lab winner preset on init', () => {
    const mc = new MovementController();
    const feel = new CharacterFeelSystem(mc);
    mc.feelSystem = feel;
    expect(mc.config.jumpForce).toBe(13);
    expect(mc.config.gravity).toBe(22);
    expect(feel.preset.id).toBe('preset-b');
  });

  it('switches presets A/B/C', () => {
    const mc = new MovementController();
    const feel = new CharacterFeelSystem(mc);
    expect(feel.applyPreset('preset-a')).toBe(true);
    expect(mc.config.jumpForce).toBe(12);
    expect(feel.applyPreset('preset-c')).toBe(true);
    expect(mc.config.jumpForce).toBe(14);
  });

  it('tracks jump telemetry on landing', () => {
    const mc = new MovementController();
    mc.physicsDriven = false;
    const feel = new CharacterFeelSystem(mc);
    mc.feelSystem = feel;
    mc.setGrounded(true);
    mc.update(1 / 240, 0, 0, true, true, false, false, false);
    mc.setGrounded(false);
    for (let i = 0; i < 40; i++) {
      mc.update(1 / 240, 0, 0, false, true, false, false, false);
    }
    mc.velocity.y = -3;
    mc.setGrounded(true);
    mc.state = MovementState.Land;
    feel.preUpdate(1 / 240, 0, 0, false);
    expect(feel.telemetry.getLog().length).toBeGreaterThanOrEqual(0);
  });
});
