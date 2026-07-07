import posesData from '../../data/poses.json';
import type { AnimationPhase, PoseChannels, PoseSet } from './types';
import { lerp } from '../../utils/Math';

const POSES = posesData.poses as Record<string, PoseSet>;

/** Reusable pose library — key, transition, anticipation, recovery per state. */

export class PoseLibrary {
  getPoseSet(phase: AnimationPhase): PoseSet {
    return POSES[phase] ?? POSES.idle;
  }

  sample(phase: AnimationPhase, kind: keyof PoseSet, blendT = 1): PoseChannels {
    const set = this.getPoseSet(phase);
    const pose = set[kind];
    if (blendT >= 1) return { ...pose };
    const key = set.key;
    return {
      bodyY: lerp(key.bodyY, pose.bodyY, blendT),
      torsoLean: lerp(key.torsoLean, pose.torsoLean, blendT),
      armL: lerp(key.armL, pose.armL, blendT),
      armR: lerp(key.armR, pose.armR, blendT),
      legL: lerp(key.legL, pose.legL, blendT),
      legR: lerp(key.legR, pose.legR, blendT),
    };
  }

  blendPoses(a: PoseChannels, b: PoseChannels, t: number): PoseChannels {
    return {
      bodyY: lerp(a.bodyY, b.bodyY, t),
      torsoLean: lerp(a.torsoLean, b.torsoLean, t),
      armL: lerp(a.armL, b.armL, t),
      armR: lerp(a.armR, b.armR, t),
      legL: lerp(a.legL, b.legL, t),
      legR: lerp(a.legR, b.legR, t),
    };
  }

  listPhases(): string[] {
    return Object.keys(POSES);
  }
}
