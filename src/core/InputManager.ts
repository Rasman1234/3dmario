import type { InputAction, InputBindings } from '../domain/types';
import { DEFAULT_INPUT_BINDINGS } from '../domain/types';
import type { IDisposable } from '../domain/interfaces';

/** Unified keyboard + gamepad input with action mapping and buffering hooks. */

export type InputState = Record<InputAction, boolean>;

export class InputManager implements IDisposable {
  private readonly bindings: InputBindings;
  private readonly pressed = new Set<string>();
  private readonly justPressed = new Set<string>();
  private readonly justReleased = new Set<string>();
  private enabled = true;

  constructor(bindings: InputBindings = DEFAULT_INPUT_BINDINGS) {
    this.bindings = bindings;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  /** Call once per frame after all input consumers have read justPressed/justReleased. */
  endFrame(): void {
    this.justPressed.clear();
    this.justReleased.clear();
  }

  isActionDown(action: InputAction): boolean {
    const keys = this.bindings[action];
    return keys.some((k) => this.pressed.has(k));
  }

  isActionJustPressed(action: InputAction): boolean {
    const keys = this.bindings[action];
    return keys.some((k) => this.justPressed.has(k));
  }

  isActionJustReleased(action: InputAction): boolean {
    const keys = this.bindings[action];
    return keys.some((k) => this.justReleased.has(k));
  }

  getMoveAxis(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    if (this.isActionDown('move_left' as InputAction)) x -= 1;
    if (this.isActionDown('move_right' as InputAction)) x += 1;
    if (this.isActionDown('move_forward' as InputAction)) y -= 1;
    if (this.isActionDown('move_backward' as InputAction)) y += 1;
    const len = Math.hypot(x, y);
    if (len > 1) {
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) {
      this.pressed.clear();
      this.justPressed.clear();
      this.justReleased.clear();
    }
  }

  dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.enabled) return;
    if (!this.pressed.has(e.code)) {
      this.justPressed.add(e.code);
    }
    this.pressed.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    if (!this.enabled) return;
    this.pressed.delete(e.code);
    this.justReleased.add(e.code);
  };

  private onBlur = (): void => {
    this.pressed.clear();
  };
}
