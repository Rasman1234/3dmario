import type { Vec3 } from '../domain/types';
import type { MovementState } from './MovementState';
import type { InputBuffer } from './InputBuffer';

export interface MovementConfig {
  walkSpeed: number;
  runSpeed: number;
  sprintSpeed: number;
  acceleration: number;
  deceleration: number;
  airAcceleration: number;
  airDeceleration: number;
  jumpForce: number;
  doubleJumpForce: number;
  coyoteTime: number;
  jumpBuffer: number;
  variableJumpCut: number;
  gravity: number;
  maxFallSpeed: number;
  groundPoundSpeed: number;
  wallJumpForceX: number;
  wallJumpForceY: number;
  wallSlideSpeed: number;
  dashSpeed: number;
  dashDuration: number;
}

export interface MovementSnapshot {
  position: Vec3;
  velocity: Vec3;
  state: MovementState;
  onGround: boolean;
  onWall: boolean;
  facingAngle: number;
  jumpCount: number;
  canDoubleJump: boolean;
  isInvincible: boolean;
  invincibleTimer: number;
}

/** Minimal movement surface for Character Feel System — avoids import cycles. */
export interface FeelMovementBridge {
  config: MovementConfig;
  position: Vec3;
  velocity: Vec3;
  state: MovementState;
  onGround: boolean;
  onWall: boolean;
  wallNormal: Vec3;
  physicsDriven: boolean;
  inputBuffer: InputBuffer;
  facingAngle: number;
}

export interface FeelSystemBridge {
  preUpdate(dt: number, moveX: number, moveZ: number, crouch: boolean): void;
  applyGroundMovement(mx: number, mz: number, speed: number, dt: number): void;
  applyAirMovement(mx: number, mz: number, dt: number): void;
  postWallCollision(): void;
  gravityMultiplier(crouch: boolean, grounded: boolean): number;
  postGrounding(grounded: boolean, almostGrounded: boolean): void;
}
