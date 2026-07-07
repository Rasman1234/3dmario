import { describe, it, expect } from 'vitest';
import { JumpTelemetry } from './JumpTelemetry';
import { DEFAULT_FEEL_CONFIG } from './FeelConfig';

describe('JumpTelemetry', () => {
  it('logs takeoff apex landing and rating', () => {
    const t = new JumpTelemetry();
    t.beginJump(2, 0);
    for (let i = 0; i < 30; i++) {
      t.advanceTick();
      t.sampleAirborne(2 + i * 0.1, 0.8);
    }
    t.advanceTick();
    const record = t.endJump(2, DEFAULT_FEEL_CONFIG);
    expect(record).toBeDefined();
    expect(record!.duration).toBeGreaterThan(0);
    expect(record!.rating).toBeGreaterThan(0);
    expect(record!.apexHeight).toBeGreaterThan(0);
  });
});
