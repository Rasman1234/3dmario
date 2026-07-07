import type { InputManager } from '../../core/InputManager';
import { InputAction } from '../../domain/types';
import { PERSONALITY_BUDGETS } from './types';

export interface InputIntent {
  action: 'jump' | 'attack' | 'sprint' | 'move';
  priority: number;
  predicted: boolean;
  forgiven: boolean;
  tick: number;
}

export interface InputVisual {
  recent: InputIntent[];
  jumpBuffered: boolean;
  forgivenessActive: boolean;
  predictedJump: boolean;
}

/** Input feel — buffering, priority, intent prediction, forgiveness, visualization. */

export class InputFeel {
  private readonly buffer: InputIntent[] = [];
  private tick = 0;
  private forgivenessTimer = 0;
  private lastMoveMag = 0;
  private jumpPressedLast = false;

  readonly forgivenessWindow = 0.08;
  readonly predictionLead = 0.05;

  record(input: InputManager, jumpBuffered: boolean): InputVisual {
    this.tick++;
    const axis = input.getMoveAxis();
    const moveMag = Math.hypot(axis.x, axis.y);
    const jumpPressed = input.isActionJustPressed(InputAction.Jump);

    let predictedJump = false;
    if (!jumpPressed && moveMag > 0.5 && this.lastMoveMag > 0.5 && !this.jumpPressedLast) {
      predictedJump = true;
      this.pushIntent('jump', 2, true, false);
    }
    if (jumpPressed) this.pushIntent('jump', 3, false, false);
    if (input.isActionJustPressed(InputAction.Attack)) this.pushIntent('attack', 2, false, false);
    if (input.isActionDown(InputAction.Sprint)) this.pushIntent('sprint', 1, false, false);
    if (moveMag > 0.1) this.pushIntent('move', 0, false, false);

    if (jumpBuffered && this.forgivenessTimer <= 0) {
      this.forgivenessTimer = this.forgivenessWindow;
      this.pushIntent('jump', 4, false, true);
    }
    if (this.forgivenessTimer > 0) this.forgivenessTimer -= 1 / 240;

    this.lastMoveMag = moveMag;
    this.jumpPressedLast = jumpPressed;

    return {
      recent: [...this.buffer].slice(-PERSONALITY_BUDGETS.inputVisualBuffer),
      jumpBuffered,
      forgivenessActive: this.forgivenessTimer > 0,
      predictedJump,
    };
  }

  getHighestPriority(): InputIntent | undefined {
    return [...this.buffer].sort((a, b) => b.priority - a.priority)[0];
  }

  private pushIntent(
    action: InputIntent['action'],
    priority: number,
    predicted: boolean,
    forgiven: boolean,
  ): void {
    this.buffer.push({ action, priority, predicted, forgiven, tick: this.tick });
    if (this.buffer.length > PERSONALITY_BUDGETS.inputVisualBuffer * 2) {
      this.buffer.splice(0, this.buffer.length - PERSONALITY_BUDGETS.inputVisualBuffer);
    }
  }
}
