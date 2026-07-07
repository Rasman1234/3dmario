import type { Vec3 } from '../domain/types';
import { MovementState } from './MovementState';
import { InputBuffer } from './InputBuffer';
import { moveToward } from '../utils/Math';
import type { MovementConfig, MovementSnapshot, FeelSystemBridge } from './MovementConfig';
import movementConfig from '../data/movement.json';

export type { MovementConfig, MovementSnapshot } from './MovementConfig';

export class MovementController {
  readonly config: MovementConfig;
  readonly inputBuffer: InputBuffer;

  position: Vec3 = { x: 0, y: 2, z: 0 };
  velocity: Vec3 = { x: 0, y: 0, z: 0 };
  state = MovementState.Idle;
  onGround = false;
  onWall = false;
  wallNormal: Vec3 = { x: 0, y: 0, z: 0 };
  facingAngle = 0;
  jumpCount = 0;
  dashTimer = 0;
  landTimer = 0;
  invincibleTimer = 0;
  jumpHeld = false;
  groundPoundActive = false;
  /** When true, physics owns position — do not integrate velocity into position here. */
  physicsDriven = false;
  feelSystem: FeelSystemBridge | null = null;

  constructor(config?: Partial<MovementConfig>) {
    this.config = { ...movementConfig, ...config } as MovementConfig;
    this.inputBuffer = new InputBuffer(this.config.jumpBuffer, this.config.coyoteTime);
  }

  update(
    dt: number,
    moveX: number,
    moveZ: number,
    jumpPressed: boolean,
    jumpHeld: boolean,
    sprint: boolean,
    crouch: boolean,
    attack: boolean,
  ): void {
    this.jumpHeld = jumpHeld;
    this.feelSystem?.preUpdate(dt, moveX, moveZ, crouch);
    this.inputBuffer.bufferJump(jumpPressed, dt);
    this.inputBuffer.updateCoyote(this.onGround, dt);

    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.state = this.onGround ? MovementState.Idle : MovementState.Fall;
    }
    if (this.landTimer > 0) {
      this.landTimer -= dt;
      if (this.landTimer <= 0 && this.state === MovementState.Land) {
        this.state = MovementState.Idle;
      }
    }

    const inputMag = Math.hypot(moveX, moveZ);
    if (inputMag > 0.01) {
      this.facingAngle = Math.atan2(moveX, moveZ);
    }

    if (this.state !== MovementState.Dash) {
      if (crouch && this.onGround) {
        this.applyGroundMovement(moveX, moveZ, this.config.walkSpeed * 0.5, dt);
        this.state = MovementState.Crouch;
      } else if (this.onGround) {
        const speed = sprint ? this.config.sprintSpeed : inputMag > 0.5 ? this.config.runSpeed : this.config.walkSpeed;
        this.applyGroundMovement(moveX, moveZ, speed, dt);
        this.state = inputMag < 0.01 ? MovementState.Idle : sprint ? MovementState.Sprint : MovementState.Walk;
      } else if (this.onWall && this.velocity.y < 0) {
        this.state = MovementState.WallSlide;
        this.velocity.y = Math.max(this.velocity.y, -this.config.wallSlideSpeed);
        this.applyAirMovement(moveX, moveZ, dt);
      } else {
        this.applyAirMovement(moveX, moveZ, dt);
        this.state = this.velocity.y > 0 ? MovementState.Jump : MovementState.Fall;
      }
    }

    if (attack && crouch && this.onGround) {
      this.groundPound();
    }

    if (this.inputBuffer.consumeJump() || (jumpPressed && this.canJump())) {
      this.jump();
    }

    if (this.onWall && jumpPressed && !this.onGround) {
      this.wallJump();
    }

    if (!this.onGround && !this.groundPoundActive) {
      const gravScale = this.feelSystem?.gravityMultiplier(crouch, this.onGround) ?? 1;
      this.velocity.y -= this.config.gravity * gravScale * dt;
      this.velocity.y = Math.max(this.velocity.y, -this.config.maxFallSpeed);
    }

    if (this.groundPoundActive) {
      this.velocity.y = -this.config.groundPoundSpeed;
    }

    if (!jumpHeld && this.velocity.y > 0) {
      this.velocity.y *= this.config.variableJumpCut;
    }

    if (!this.physicsDriven) {
      const wasAirborne = !this.onGround;
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      this.position.z += this.velocity.z * dt;

      if (this.onGround && wasAirborne && this.velocity.y <= 0) {
        this.triggerLanding();
      }

      this.position.y = Math.max(this.position.y, -50);
    }
  }

  /** Called by orchestrator when physics reports grounded transition. */
  applyGroundingTransition(wasGrounded: boolean, grounded: boolean): void {
    if (grounded && !wasGrounded && this.velocity.y <= 0) {
      this.triggerLanding();
    }
    if (!grounded && this.velocity.y < 0 && this.state !== MovementState.Jump && this.state !== MovementState.DoubleJump) {
      this.state = MovementState.Fall;
    }
  }

  private triggerLanding(): void {
    this.state = MovementState.Land;
    this.landTimer = 0.15;
    this.groundPoundActive = false;
    this.jumpCount = 0;
    if (this.velocity.y < 0) this.velocity.y = 0;
  }

  syncPositionFromPhysics(pos: Vec3): void {
    this.position = { ...pos };
    this.position.y = Math.max(this.position.y, -50);
  }

  private canJump(): boolean {
    if (this.onGround || this.inputBuffer.canCoyoteJump()) return true;
    if (this.jumpCount < 1) return true;
    return false;
  }

  private jump(): void {
    if (this.onGround || this.inputBuffer.canCoyoteJump()) {
      this.velocity.y = this.config.jumpForce;
      this.jumpCount = 1;
      this.state = MovementState.Jump;
      this.onGround = false;
    } else if (this.jumpCount < 2) {
      this.velocity.y = this.config.doubleJumpForce;
      this.jumpCount = 2;
      this.state = MovementState.DoubleJump;
    }
  }

  private wallJump(): void {
    this.velocity.x = this.wallNormal.x * this.config.wallJumpForceX;
    this.velocity.y = this.config.wallJumpForceY;
    this.velocity.z = this.wallNormal.z * this.config.wallJumpForceX;
    this.state = MovementState.WallJump;
    this.onWall = false;
    this.jumpCount = 1;
  }

  groundPound(): void {
    if (!this.onGround) {
      this.groundPoundActive = true;
      this.velocity.x = 0;
      this.velocity.z = 0;
      this.state = MovementState.GroundPound;
    }
  }

  dash(): void {
    if (this.dashTimer <= 0) {
      this.dashTimer = this.config.dashDuration;
      this.state = MovementState.Dash;
      this.velocity.x = Math.sin(this.facingAngle) * this.config.dashSpeed;
      this.velocity.z = Math.cos(this.facingAngle) * this.config.dashSpeed;
    }
  }

  setGrounded(grounded: boolean): void {
    this.onGround = grounded;
    if (grounded) this.groundPoundActive = false;
    const almost = !grounded && this.velocity.y <= 0 && this.velocity.y > -2;
    this.feelSystem?.postGrounding(grounded, almost);
  }

  setWall(wall: boolean, normal?: Vec3): void {
    this.onWall = wall;
    if (normal) this.wallNormal = normal;
    if (wall) this.feelSystem?.postWallCollision();
  }

  applyKnockback(dir: Vec3, force: number): void {
    this.velocity.x = dir.x * force;
    this.velocity.y = Math.abs(dir.y) * force * 0.5 + 4;
    this.velocity.z = dir.z * force;
    this.invincibleTimer = 1.0;
  }

  private applyGroundMovement(mx: number, mz: number, targetSpeed: number, dt: number): void {
    if (this.feelSystem) {
      this.feelSystem.applyGroundMovement(mx, mz, targetSpeed, dt);
      return;
    }
    const targetX = mx * targetSpeed;
    const targetZ = mz * targetSpeed;
    this.velocity.x = moveToward(this.velocity.x, targetX, this.config.acceleration * dt);
    this.velocity.z = moveToward(this.velocity.z, targetZ, this.config.acceleration * dt);
    if (mx === 0) this.velocity.x = moveToward(this.velocity.x, 0, this.config.deceleration * dt);
    if (mz === 0) this.velocity.z = moveToward(this.velocity.z, 0, this.config.deceleration * dt);
  }

  private applyAirMovement(mx: number, mz: number, dt: number): void {
    if (this.feelSystem) {
      this.feelSystem.applyAirMovement(mx, mz, dt);
      return;
    }
    const airControl = 0.8;
    const targetX = mx * this.config.runSpeed * airControl;
    const targetZ = mz * this.config.runSpeed * airControl;
    this.velocity.x = moveToward(this.velocity.x, targetX, this.config.airAcceleration * dt);
    this.velocity.z = moveToward(this.velocity.z, targetZ, this.config.airAcceleration * dt);
  }

  snapshot(): MovementSnapshot {
    return {
      position: { ...this.position },
      velocity: { ...this.velocity },
      state: this.state,
      onGround: this.onGround,
      onWall: this.onWall,
      facingAngle: this.facingAngle,
      jumpCount: this.jumpCount,
      canDoubleJump: this.jumpCount < 2,
      isInvincible: this.invincibleTimer > 0,
      invincibleTimer: this.invincibleTimer,
    };
  }

  reset(pos: Vec3): void {
    this.position = { ...pos };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.state = MovementState.Idle;
    this.onGround = false;
    this.jumpCount = 0;
    this.inputBuffer.reset();
  }
}
