/** Jump buffer, coyote time, and input buffering for responsive platforming. */

export interface BufferedInput {
  jump: boolean;
  attack: boolean;
  interact: boolean;
  sprint: boolean;
  crouch: boolean;
  moveX: number;
  moveZ: number;
}

export class InputBuffer {
  private jumpBufferTimer = 0;
  private coyoteTimer = 0;
  private readonly jumpBufferDuration: number;
  private readonly coyoteDuration: number;

  constructor(jumpBuffer = 0.15, coyoteTime = 0.12) {
    this.jumpBufferDuration = jumpBuffer;
    this.coyoteDuration = coyoteTime;
  }

  bufferJump(pressed: boolean, dt: number): void {
    if (pressed) this.jumpBufferTimer = this.jumpBufferDuration;
    else this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
  }

  updateCoyote(onGround: boolean, dt: number): void {
    if (onGround) this.coyoteTimer = this.coyoteDuration;
    else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
  }

  consumeJump(): boolean {
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      return true;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = 0;
      return true;
    }
    return false;
  }

  canCoyoteJump(): boolean {
    return this.coyoteTimer > 0;
  }

  get jumpBuffered(): boolean {
    return this.jumpBufferTimer > 0;
  }

  reset(): void {
    this.jumpBufferTimer = 0;
    this.coyoteTimer = 0;
  }
}
