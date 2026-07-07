import type { Vec3 } from '../../domain/types';
import type { FeelConfig } from './FeelConfig';
import { curveMoveToward, momentumBlend } from './MovementCurves';
import { clamp, lerp } from '../../utils/Math';

export interface FeelMechanicsState {
  landingRecoveryTimer: number;
  platformVelocity: Vec3;
  slopeNormal: Vec3;
  correctionsApplied: number;
  apexHangActive: boolean;
}

export function createFeelState(): FeelMechanicsState {
  return {
    landingRecoveryTimer: 0,
    platformVelocity: { x: 0, y: 0, z: 0 },
    slopeNormal: { x: 0, y: 1, z: 0 },
    correctionsApplied: 0,
    apexHangActive: false,
  };
}

export function applyGroundMovementCurved(
  velocity: Vec3,
  mx: number,
  mz: number,
  targetSpeed: number,
  dt: number,
  accel: number,
  decel: number,
  feel: FeelConfig,
  recoveryScale: number,
): void {
  const scale = recoveryScale;
  const targetX = mx * targetSpeed * scale;
  const targetZ = mz * targetSpeed * scale;
  velocity.x = curveMoveToward(velocity.x, targetX, accel, dt, feel.accelCurve);
  velocity.z = curveMoveToward(velocity.z, targetZ, accel, dt, feel.accelCurve);
  if (mx === 0) velocity.x = curveMoveToward(velocity.x, 0, decel, dt, feel.decelCurve);
  if (mz === 0) velocity.z = curveMoveToward(velocity.z, 0, decel, dt, feel.decelCurve);
}

export function applyAirMovementCurved(
  velocity: Vec3,
  mx: number,
  mz: number,
  runSpeed: number,
  dt: number,
  airAccel: number,
  feel: FeelConfig,
): void {
  const targetX = mx * runSpeed * feel.airControl;
  const targetZ = mz * runSpeed * feel.airControl;
  velocity.x = momentumBlend(velocity.x, targetX, dt, feel.momentumCurve);
  velocity.z = momentumBlend(velocity.z, targetZ, dt, feel.momentumCurve);
  if (mx !== 0) {
    velocity.x = curveMoveToward(velocity.x, targetX, airAccel, dt, feel.accelCurve);
  }
  if (mz !== 0) {
    velocity.z = curveMoveToward(velocity.z, targetZ, airAccel, dt, feel.accelCurve);
  }
}

export function applyCornerCorrection(
  velocity: Vec3,
  wallNormal: Vec3,
  onWall: boolean,
  feel: FeelConfig,
  state: FeelMechanicsState,
): void {
  if (!onWall) return;
  const horizSpeed = Math.hypot(velocity.x, velocity.z);
  if (horizSpeed < 0.1) return;
  const dot = velocity.x * wallNormal.x + velocity.z * wallNormal.z;
  if (dot >= -0.1) return;
  const slideX = velocity.x - wallNormal.x * dot;
  const slideZ = velocity.z - wallNormal.z * dot;
  velocity.x = lerpVec(velocity.x, slideX, feel.cornerCorrection);
  velocity.z = lerpVec(velocity.z, slideZ, feel.cornerCorrection);
  state.correctionsApplied++;
}

export function applyGroundSnap(velocity: Vec3, grounded: boolean, almostGrounded: boolean, feel: FeelConfig): void {
  if (!grounded && almostGrounded && velocity.y <= 0) {
    velocity.y -= feel.groundSnap;
  }
}

export function applyLedgeSnap(
  position: Vec3,
  velocity: Vec3,
  moveX: number,
  moveZ: number,
  grounded: boolean,
  feel: FeelConfig,
  state: FeelMechanicsState,
): void {
  if (grounded || Math.hypot(moveX, moveZ) < 0.1) return;
  const forward = Math.hypot(velocity.x, velocity.z);
  if (forward < 2) return;
  const nudge = feel.ledgeSnap * feel.ledgeSnapDistance;
  position.x += moveX * nudge;
  position.z += moveZ * nudge;
  state.correctionsApplied++;
}

export function applyApexHang(velocity: Vec3, feel: FeelConfig, state: FeelMechanicsState): number {
  const nearApex = Math.abs(velocity.y) < feel.apexHangVelocityThreshold;
  state.apexHangActive = nearApex && velocity.y > -1;
  return state.apexHangActive ? feel.apexHangGravityScale : 1;
}

export function applyFastFall(velocity: Vec3, crouch: boolean, grounded: boolean, feel: FeelConfig): number {
  if (grounded || !crouch) return 1;
  if (velocity.y > feel.fastFallThreshold) return 1;
  return feel.fastFallMultiplier;
}

export function applySlopeHandling(velocity: Vec3, grounded: boolean, feel: FeelConfig, state: FeelMechanicsState): void {
  if (!grounded) return;
  const slopeAngle = Math.acos(clamp(state.slopeNormal.y, 0, 1));
  if (slopeAngle < 0.05) return;
  const scale = lerp(1, feel.slopeSpeedScale, slopeAngle / (Math.PI / 4));
  velocity.x *= scale;
  velocity.z *= scale;
}

export function applyPlatformTransfer(velocity: Vec3, grounded: boolean, feel: FeelConfig, state: FeelMechanicsState): void {
  if (!grounded) return;
  const t = feel.platformVelocityTransfer;
  velocity.x += state.platformVelocity.x * t;
  velocity.z += state.platformVelocity.z * t;
}

export function startLandingRecovery(state: FeelMechanicsState, feel: FeelConfig): void {
  state.landingRecoveryTimer = feel.landingRecoveryDuration;
}

export function landingRecoveryScale(state: FeelMechanicsState, feel: FeelConfig): number {
  if (state.landingRecoveryTimer <= 0) return 1;
  const t = state.landingRecoveryTimer / feel.landingRecoveryDuration;
  return lerp(feel.landingRecoverySpeedScale, 1, 1 - t);
}

export function tickFeelState(state: FeelMechanicsState, dt: number): void {
  if (state.landingRecoveryTimer > 0) state.landingRecoveryTimer -= dt;
}

function lerpVec(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}
