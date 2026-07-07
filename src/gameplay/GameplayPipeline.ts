import { InputAction } from '../domain/types';
import type { InputManager } from '../core/InputManager';
import type { EventBus } from '../infrastructure/EventBus';
import { MovementController } from '../gameplay/MovementController';
import { CharacterFeelSystem } from '../gameplay/feel/CharacterFeelSystem';
import { loadActivePreset } from '../gameplay/feel/FeelConfig';
import { CharacterPersonalitySystem } from '../gameplay/personality/CharacterPersonalitySystem';

/** Input → movement + feel + personality. */

export class GameplayPipeline {
  readonly movement: MovementController;
  readonly feel: CharacterFeelSystem;
  personality: CharacterPersonalitySystem | null = null;

  constructor(movement?: MovementController) {
    const { movement: labMovement } = loadActivePreset();
    this.movement = movement ?? new MovementController(labMovement);
    this.feel = new CharacterFeelSystem(this.movement);
    this.movement.feelSystem = this.feel;
  }

  initPersonality(events: EventBus): void {
    this.personality = new CharacterPersonalitySystem(this.movement, this.feel, events);
  }

  processInput(dt: number, input: InputManager): void {
    const axis = input.getMoveAxis();
    this.movement.update(
      dt,
      axis.x,
      axis.y,
      input.isActionJustPressed(InputAction.Jump),
      input.isActionDown(InputAction.Jump),
      input.isActionDown(InputAction.Sprint),
      input.isActionDown(InputAction.Crouch),
      input.isActionJustPressed(InputAction.Attack),
    );
  }
}
