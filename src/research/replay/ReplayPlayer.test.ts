import { describe, it, expect } from 'vitest';
import { ReplayPlayer } from './ReplayPlayer';
import { MovementSandbox, forwardJumpSequence, FIXED_DT } from '../sandbox/MovementSandbox';

describe('ReplayPlayer', () => {
  it('replays deterministically and compares runs', async () => {
    const player = new ReplayPlayer();
    const replay = {
      version: 1,
      seed: 7,
      sceneId: 'jump_laboratory' as const,
      fixedDt: FIXED_DT,
      movementConfig: {},
      frames: forwardJumpSequence(90),
    };

    const a = await player.play(new MovementSandbox(), replay);
    const b = await player.play(new MovementSandbox(), replay);
    const cmp = player.compare(a, b);

    expect(cmp.hashMatch).toBe(true);
    expect(cmp.maxPositionDelta).toBeLessThan(0.01);
    expect(player.ghostOverlay(a.frames, b.frames)).toHaveLength(90);
  });
});
