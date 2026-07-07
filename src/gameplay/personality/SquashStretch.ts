import type { PersonalityProfile } from './types';
import { clamp, lerp } from '../../utils/Math';

export interface SquashStretchState {
  squashX: number;
  squashY: number;
  stretch: number;
  overshoot: number;
  recoveryT: number;
}

export function createSquashState(): SquashStretchState {
  return { squashX: 1, squashY: 1, stretch: 1, overshoot: 0, recoveryT: 0 };
}

/** Squash & stretch — takeoff, ascent, impact, overshoot, recovery. */

export class SquashStretch {
  constructor(private profile: PersonalityProfile) {}

  setProfile(profile: PersonalityProfile): void {
    this.profile = profile;
  }

  onTakeoff(state: SquashStretchState): void {
    state.squashX = 1 + 0.2 * this.profile.squashScale;
    state.squashY = 1 - 0.25 * this.profile.squashScale;
    state.stretch = 1;
    state.overshoot = 0;
    state.recoveryT = 0;
  }

  onAscent(state: SquashStretchState, velocityY: number): void {
    const t = clamp(velocityY / 12, 0, 1);
    state.squashX = lerp(state.squashX, 1 - 0.1 * this.profile.stretchScale, t);
    state.squashY = lerp(state.squashY, 1 + 0.2 * this.profile.stretchScale, t);
    state.stretch = 1 + t * 0.15 * this.profile.stretchScale;
  }

  onImpact(state: SquashStretchState, landingVelocity: number): void {
    const impact = clamp(Math.abs(landingVelocity) / 10, 0, 1);
    state.squashX = 1 + 0.35 * impact * this.profile.squashScale;
    state.squashY = 1 - 0.4 * impact * this.profile.squashScale;
    state.stretch = 1;
    state.overshoot = impact * 0.1;
    state.recoveryT = 0;
  }

  tick(state: SquashStretchState, dt: number): void {
    state.recoveryT += dt;
    const recover = clamp(state.recoveryT * 10, 0, 1);
    state.squashX = lerp(state.squashX, 1, recover);
    state.squashY = lerp(state.squashY, 1, recover);
    state.stretch = lerp(state.stretch, 1, recover);
    state.overshoot = lerp(state.overshoot, 0, recover);
  }
}
