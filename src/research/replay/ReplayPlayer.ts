import type { ReplayFile, TelemetryFrame } from '../types';
import { MovementSandbox, hashPositions } from '../sandbox/MovementSandbox';

export interface ReplayPlaybackResult {
  frames: TelemetryFrame[];
  positionHash: string;
  divergence?: number;
}

/** Deterministic replay playback and comparison. */

export class ReplayPlayer {
  async play(sandbox: MovementSandbox, replay: ReplayFile): Promise<ReplayPlaybackResult> {
    sandbox.setSeed(replay.seed);
    await sandbox.loadSceneAsync(replay.sceneId, replay.movementConfig);
    const { frames } = sandbox.runSequence(replay.frames);
    return {
      frames,
      positionHash: hashPositions(frames),
    };
  }

  compare(
    baseline: ReplayPlaybackResult,
    variant: ReplayPlaybackResult,
  ): { hashMatch: boolean; maxPositionDelta: number } {
    const len = Math.min(baseline.frames.length, variant.frames.length);
    let maxDelta = 0;
    for (let i = 0; i < len; i++) {
      const a = baseline.frames[i].position;
      const b = variant.frames[i].position;
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (d > maxDelta) maxDelta = d;
    }
    return {
      hashMatch: baseline.positionHash === variant.positionHash,
      maxPositionDelta: maxDelta,
    };
  }

  ghostOverlay(
    baseline: TelemetryFrame[],
    current: TelemetryFrame[],
  ): { tick: number; ghost: { x: number; z: number }; current: { x: number; z: number } }[] {
    const len = Math.min(baseline.length, current.length);
    const overlay = [];
    for (let i = 0; i < len; i++) {
      overlay.push({
        tick: baseline[i].tick,
        ghost: { x: baseline[i].position.x, z: baseline[i].position.z },
        current: { x: current[i].position.x, z: current[i].position.z },
      });
    }
    return overlay;
  }
}
