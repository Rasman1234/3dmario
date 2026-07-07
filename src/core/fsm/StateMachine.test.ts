import { describe, it, expect, vi } from 'vitest';
import { StateMachine } from './StateMachine';

type TestState = 'idle' | 'walk' | 'jump' | 'fall';

const TRANSITIONS: Record<TestState, readonly TestState[]> = {
  idle: ['walk', 'jump'],
  walk: ['idle', 'jump', 'fall'],
  jump: ['fall'],
  fall: ['idle', 'walk'],
};

describe('StateMachine', () => {
  it('starts in initial state', () => {
    const sm = new StateMachine<TestState>('idle', TRANSITIONS);
    expect(sm.current).toBe('idle');
    expect(sm.is('idle')).toBe(true);
  });

  it('allows valid transitions', () => {
    const handler = vi.fn();
    const sm = new StateMachine<TestState>('idle', TRANSITIONS, handler);
    expect(sm.transition('walk')).toBe(true);
    expect(sm.current).toBe('walk');
    expect(handler).toHaveBeenCalledWith('idle', 'walk');
  });

  it('rejects invalid transitions', () => {
    const sm = new StateMachine<TestState>('idle', TRANSITIONS);
    expect(sm.canTransition('fall')).toBe(false);
    expect(sm.transition('fall')).toBe(false);
    expect(sm.current).toBe('idle');
  });

  it('force bypasses validation', () => {
    const sm = new StateMachine<TestState>('idle', TRANSITIONS);
    sm.force('fall');
    expect(sm.current).toBe('fall');
  });
});
