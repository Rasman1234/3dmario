import { describe, it, expect, vi } from 'vitest';
import { GameStateMachine } from './GameStateMachine';
import { GameStateId } from '../domain/types';

describe('GameStateMachine', () => {
  it('boots into loading then main menu', () => {
    const handler = vi.fn();
    const sm = new GameStateMachine(handler);
    expect(sm.current).toBe(GameStateId.Boot);
    expect(sm.transition(GameStateId.Loading)).toBe(true);
    expect(sm.transition(GameStateId.MainMenu)).toBe(true);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('supports play/pause cycle', () => {
    const sm = new GameStateMachine(vi.fn());
    sm.force(GameStateId.Playing);
    expect(sm.transition(GameStateId.Paused)).toBe(true);
    expect(sm.transition(GameStateId.Playing)).toBe(true);
  });

  it('blocks invalid boss transitions from main menu', () => {
    const sm = new GameStateMachine(vi.fn());
    sm.force(GameStateId.MainMenu);
    expect(sm.transition(GameStateId.BossFight)).toBe(false);
  });
});
