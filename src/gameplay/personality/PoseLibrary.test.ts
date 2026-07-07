import { describe, it, expect } from 'vitest';
import { PoseLibrary } from './PoseLibrary';

describe('PoseLibrary', () => {
  const lib = new PoseLibrary();

  it('provides key anticipation transition recovery poses', () => {
    const set = lib.getPoseSet('launch');
    expect(set.key.armL).toBeGreaterThan(0);
    expect(set.anticipation.bodyY).toBeLessThan(set.key.bodyY);
    expect(set.recovery.bodyY).toBeLessThanOrEqual(set.key.bodyY);
  });

  it('lists movement phases', () => {
    expect(lib.listPhases()).toContain('land');
    expect(lib.listPhases()).toContain('victory');
  });
});
