import { describe, it, expect } from 'vitest';
import { LevelManager } from './LevelManager';
import { EventBus } from '../infrastructure/EventBus';

describe('LevelManager checkpoints', () => {
  it('probes checkpoint when player is in range', () => {
    const events = new EventBus();
    const lm = new LevelManager(events);
    (lm as unknown as { config: object }).config = {
      checkpoints: [
        { x: 0, y: 2, z: 0 },
        { x: 0, y: 4, z: -15 },
      ],
    };
    (lm as unknown as { checkpointIndex: number }).checkpointIndex = 0;

    const hit = lm.probeCheckpoint({ x: 0.5, y: 4, z: -14.5 });
    expect(hit).toBe(1);
  });

  it('does not re-trigger earlier checkpoints', () => {
    const lm = new LevelManager(new EventBus());
    (lm as unknown as { config: object }).config = {
      checkpoints: [{ x: 0, y: 2, z: 0 }],
    };
    (lm as unknown as { checkpointIndex: number }).checkpointIndex = 0;
    expect(lm.probeCheckpoint({ x: 0, y: 2, z: 0 })).toBeNull();
  });
});
