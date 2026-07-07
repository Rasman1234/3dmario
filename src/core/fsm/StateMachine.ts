import type { IStateMachine } from '../../domain/interfaces';

/** Generic finite state machine with validated transitions. */

export type TransitionMap<TState extends string> = Record<TState, readonly TState[]>;
export type TransitionHandler<TState extends string> = (from: TState, to: TState) => void;

export class StateMachine<TState extends string> implements IStateMachine<TState> {
  private state: TState;
  private readonly transitions: TransitionMap<TState>;
  private readonly onTransition?: TransitionHandler<TState>;

  constructor(
    initial: TState,
    transitions: TransitionMap<TState>,
    onTransition?: TransitionHandler<TState>,
  ) {
    this.state = initial;
    this.transitions = transitions;
    this.onTransition = onTransition;
  }

  get current(): TState {
    return this.state;
  }

  is(...states: TState[]): boolean {
    return states.includes(this.state);
  }

  canTransition(to: TState): boolean {
    return this.transitions[this.state]?.includes(to) ?? false;
  }

  transition(to: TState): boolean {
    if (!this.canTransition(to)) return false;
    const from = this.state;
    this.state = to;
    this.onTransition?.(from, to);
    return true;
  }

  force(to: TState): void {
    const from = this.state;
    this.state = to;
    this.onTransition?.(from, to);
  }
}
