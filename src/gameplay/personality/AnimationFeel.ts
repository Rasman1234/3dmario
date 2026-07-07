import { MovementState } from '../MovementState';
import type { AnimationPhase, PersonalityProfile } from './types';
import { getTransitions } from './types';
import { PoseLibrary } from './PoseLibrary';
import { phaseProgress } from './AnimationCurves';

/** Animation-driven feel — configurable phase transitions. */

export class AnimationFeel {
  private readonly poses = new PoseLibrary();
  private phase: AnimationPhase = 'idle';
  private phaseElapsed = 0;
  private prevMovementState = MovementState.Idle;
  private facingAngle = 0;
  private turnVelocity = 0;

  constructor(private profile: PersonalityProfile) {}

  setProfile(profile: PersonalityProfile): void {
    this.profile = profile;
  }

  update(
    dt: number,
    movementState: MovementState,
    velocityY: number,
    grounded: boolean,
    facingAngle: number,
    speed: number,
  ): { phase: AnimationPhase; t: number; poseKind: 'key' | 'anticipation' | 'transition' | 'recovery' } {
    const turnDelta = facingAngle - this.facingAngle;
    this.turnVelocity = turnDelta / Math.max(dt, 0.001);
    this.facingAngle = facingAngle;

    const target = this.resolvePhase(movementState, velocityY, grounded, speed, Math.abs(turnDelta));
    if (target !== this.phase) {
      this.phase = target;
      this.phaseElapsed = 0;
    } else {
      this.phaseElapsed += dt;
    }

    const config = getTransitions()[this.phase] ?? { duration: 0.1, curve: 'linear' };
    const t = phaseProgress(this.phaseElapsed, config);
    const poseKind = this.poseKindForPhase(t, movementState);

    this.prevMovementState = movementState;
    return { phase: this.phase, t, poseKind };
  }

  forcePhase(phase: AnimationPhase): void {
    this.phase = phase;
    this.phaseElapsed = 0;
  }

  getPhase(): AnimationPhase {
    return this.phase;
  }

  getPoseLibrary(): PoseLibrary {
    return this.poses;
  }

  getTiming(): Record<string, number> {
    const transitions = getTransitions();
    return Object.fromEntries(Object.entries(transitions).map(([k, v]) => [k, v.duration]));
  }

  getTurnVelocity(): number {
    return this.turnVelocity;
  }

  private resolvePhase(
    state: MovementState,
    velocityY: number,
    grounded: boolean,
    speed: number,
    turnDelta: number,
  ): AnimationPhase {
    if (state === MovementState.Dead) return 'damage';
    if (this.phase === 'victory') return 'victory';

    if (state === MovementState.Land) return 'land';
    if (state === MovementState.Jump || state === MovementState.DoubleJump || state === MovementState.WallJump) {
      if (this.phaseElapsed < this.framesToSec(this.profile.anticipationFrames) && this.prevMovementState !== state) {
        return 'jump_anticipation';
      }
      if (velocityY > 1) return this.phaseElapsed < this.framesToSec(this.profile.hangFrames) ? 'launch' : 'hang';
      return 'fall';
    }
    if (!grounded && velocityY < -1) return 'fall';
    if (grounded && this.prevMovementState === MovementState.Fall) {
      return this.phaseElapsed < this.framesToSec(this.profile.recoveryFrames) ? 'recovery' : 'idle';
    }
    if (turnDelta > 0.3 && speed > 2) return 'turn';
    if (speed > 8) return 'run';
    if (speed < 0.5 && this.prevMovementState === MovementState.Run) return 'stop';
    if (speed > 0.5) return 'run';
    return 'idle';
  }

  private poseKindForPhase(
    t: number,
    state: MovementState,
  ): 'key' | 'anticipation' | 'transition' | 'recovery' {
    if (state === MovementState.Land) return t < 0.3 ? 'transition' : 'recovery';
    if (t < 0.2) return 'anticipation';
    if (t > 0.8) return 'recovery';
    if (t > 0.4) return 'transition';
    return 'key';
  }

  private framesToSec(frames: number): number {
    return frames / 240;
  }
}
