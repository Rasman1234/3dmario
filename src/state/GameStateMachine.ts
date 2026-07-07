import { GameStateId } from '../domain/types';
import { StateMachine } from '../core/fsm/StateMachine';
import type { TransitionHandler } from '../core/fsm/StateMachine';

/** Top-level game flow state machine. */

const VALID_TRANSITIONS: Record<GameStateId, readonly GameStateId[]> = {
  [GameStateId.Boot]: [GameStateId.Loading],
  [GameStateId.Loading]: [GameStateId.MainMenu],
  [GameStateId.MainMenu]: [GameStateId.WorldSelect, GameStateId.LevelLoading],
  [GameStateId.WorldSelect]: [GameStateId.MainMenu, GameStateId.LevelLoading],
  [GameStateId.LevelLoading]: [GameStateId.Playing, GameStateId.MainMenu],
  [GameStateId.Playing]: [
    GameStateId.Paused,
    GameStateId.Cutscene,
    GameStateId.BossIntro,
    GameStateId.LevelComplete,
    GameStateId.GameOver,
  ],
  [GameStateId.Paused]: [GameStateId.Playing, GameStateId.MainMenu],
  [GameStateId.Cutscene]: [GameStateId.Playing, GameStateId.BossFight, GameStateId.LevelComplete],
  [GameStateId.BossIntro]: [GameStateId.BossFight],
  [GameStateId.BossFight]: [GameStateId.LevelComplete, GameStateId.GameOver, GameStateId.Playing],
  [GameStateId.LevelComplete]: [GameStateId.WorldSelect, GameStateId.MainMenu, GameStateId.LevelLoading],
  [GameStateId.GameOver]: [GameStateId.MainMenu, GameStateId.LevelLoading],
  [GameStateId.Victory]: [GameStateId.MainMenu],
};

export class GameStateMachine extends StateMachine<GameStateId> {
  constructor(onTransition: TransitionHandler<GameStateId>) {
    super(GameStateId.Boot, VALID_TRANSITIONS, onTransition);
  }
}
