import { describe, it, expect, vi } from 'vitest';
import { PowerUpManager } from './PowerUpManager';
import { PowerUpType } from './PowerUpType';
import { EventBus } from '../infrastructure/EventBus';

describe('PowerUpManager', () => {
  it('activates speed boost', () => {
    const events = new EventBus();
    const pm = new PowerUpManager(events);
    pm.collect(PowerUpType.Speed);
    expect(pm.speedMult).toBeGreaterThan(1);
  });

  it('star grants invincibility', () => {
    const pm = new PowerUpManager(new EventBus());
    pm.collect(PowerUpType.Star);
    expect(pm.isInvincible).toBe(true);
  });

  it('emits collection event', () => {
    const events = new EventBus();
    const handler = vi.fn();
    events.on('powerup:collected', handler);
    const pm = new PowerUpManager(events);
    pm.collect(PowerUpType.Magnet);
    expect(handler).toHaveBeenCalled();
  });
});
