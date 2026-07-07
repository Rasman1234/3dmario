import { InputAction } from '../domain/types';
import type { InputSnapshot } from './types';

/** Scriptable input driver — same surface as InputManager for GameplayPipeline. */

export class ResearchInputManager {
  private snapshot: InputSnapshot = {
    moveX: 0,
    moveZ: 0,
    jumpPressed: false,
    jumpHeld: false,
    sprint: false,
    crouch: false,
    attack: false,
  };

  private jumpJustPressed = false;
  private attackJustPressed = false;

  setSnapshot(frame: InputSnapshot): void {
    this.jumpJustPressed = frame.jumpPressed && !this.snapshot.jumpPressed;
    this.attackJustPressed = frame.attack && !this.snapshot.attack;
    this.snapshot = { ...frame };
  }

  update(): void {
    this.jumpJustPressed = false;
    this.attackJustPressed = false;
  }

  isActionDown(action: InputAction): boolean {
    switch (action) {
      case InputAction.Jump:
        return this.snapshot.jumpHeld;
      case InputAction.Sprint:
        return this.snapshot.sprint;
      case InputAction.Crouch:
        return this.snapshot.crouch;
      case InputAction.Attack:
        return this.snapshot.attack;
      case InputAction.MoveLeft:
        return this.snapshot.moveX < 0;
      case InputAction.MoveRight:
        return this.snapshot.moveX > 0;
      case InputAction.MoveForward:
        return this.snapshot.moveZ < 0;
      case InputAction.MoveBackward:
        return this.snapshot.moveZ > 0;
      default:
        return false;
    }
  }

  isActionJustPressed(action: InputAction): boolean {
    switch (action) {
      case InputAction.Jump:
        return this.snapshot.jumpPressed || this.jumpJustPressed;
      case InputAction.Attack:
        return this.snapshot.attack || this.attackJustPressed;
      default:
        return false;
    }
  }

  isActionJustReleased(): boolean {
    return false;
  }

  getMoveAxis(): { x: number; y: number } {
    return { x: this.snapshot.moveX, y: this.snapshot.moveZ };
  }

  setEnabled(): void {
    /* no-op for research */
  }

  dispose(): void {
    /* no-op */
  }
}
