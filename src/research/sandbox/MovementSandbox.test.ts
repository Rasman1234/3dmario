import { describe, it, expect, afterEach } from 'vitest';
import {
  MovementSandbox,
  forwardJumpSequence,
  hashPositions,
  FIXED_DT,
} from './MovementSandbox';

describe('MovementSandbox', () => {
  let sandbox: MovementSandbox;

  afterEach(() => {
    sandbox?.dispose();
  });

  it('produces identical hashes for identical inputs (determinism)', async () => {
    sandbox = new MovementSandbox();
    await sandbox.init();
    sandbox.setSeed(42);
    await sandbox.loadSceneAsync('jump_laboratory');
    const inputs = forwardJumpSequence(120);
    const runA = sandbox.runSequence(inputs, 120);
    sandbox.dispose();

    sandbox = new MovementSandbox();
    await sandbox.init();
    sandbox.setSeed(42);
    await sandbox.loadSceneAsync('jump_laboratory');
    const runB = sandbox.runSequence(inputs, 120);

    expect(hashPositions(runA.frames)).toBe(hashPositions(runB.frames));
  });

  it('loads all lab scenes', async () => {
    for (const scene of ['physics_isolation', 'jump_laboratory', 'gap_laboratory', 'platform_laboratory'] as const) {
      sandbox = new MovementSandbox();
      await sandbox.init();
      await sandbox.loadSceneAsync(scene);
      const { frames } = sandbox.runSequence(forwardJumpSequence(30), 30);
      expect(frames.length).toBe(30);
      expect(frames[0].dt).toBe(FIXED_DT);
      sandbox.dispose();
    }
  });

  it('stays within performance budget for 120 ticks', async () => {
    sandbox = new MovementSandbox();
    await sandbox.init();
    await sandbox.loadSceneAsync('jump_laboratory');
    const start = performance.now();
    sandbox.runSequence(forwardJumpSequence(120), 120);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });
});
