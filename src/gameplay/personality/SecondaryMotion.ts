import type { PersonalityProfile, PoseChannels } from './types';

/** Procedural secondary motion — hat, limbs, torso, backpack. */

export class SecondaryMotion {
  constructor(private profile: PersonalityProfile) {}

  setProfile(profile: PersonalityProfile): void {
    this.profile = profile;
  }

  solve(simTick: number, pose: PoseChannels, speed: number, _phaseT: number) {
    const i = this.profile.secondaryIntensity;
    const w = simTick * 0.08;
    const bob = Math.sin(w) * 0.03 * i;
    const sway = Math.sin(w * 0.7) * 0.04 * i;

    return {
      hat: { x: sway * 0.5, y: bob + pose.bodyY * 0.2, z: Math.sin(w * 1.3) * 0.02 * i },
      armL: { x: pose.armL + Math.sin(w + 1) * 0.05 * i, z: sway },
      armR: { x: pose.armR + Math.sin(w + 2) * 0.05 * i, z: -sway },
      legL: { x: pose.legL + Math.sin(w * 1.5) * speed * 0.01 * i },
      legR: { x: pose.legR + Math.sin(w * 1.5 + Math.PI) * speed * 0.01 * i },
      torso: { x: pose.torsoLean + sway * 0.3 },
      backpack: { y: bob * 0.5, z: -Math.abs(sway) * 0.5 * i },
    };
  }
}
