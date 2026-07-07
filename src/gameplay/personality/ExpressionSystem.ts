import type { ExpressionType, PersonalityProfile } from './types';
import { PERSONALITY_BUDGETS } from './types';

export interface ExpressionEvent {
  type: ExpressionType;
  tick: number;
  intensity: number;
  message: string;
}

/** Rewards skillful play with expressive responses. */

export class ExpressionSystem {
  private readonly events: ExpressionEvent[] = [];
  private chainJumpCount = 0;
  private tick = 0;

  constructor(private profile: PersonalityProfile) {}

  setProfile(profile: PersonalityProfile): void {
    this.profile = profile;
  }

  advanceTick(): void {
    this.tick++;
  }

  onLongJump(apexHeight: number): ExpressionEvent | null {
    if (apexHeight < 3) return null;
    return this.emit('long_jump', Math.min(1, apexHeight / 5), 'Nice hang time!');
  }

  onLanding(rating: number, landingVelocity: number): ExpressionEvent | null {
    if (rating >= 0.85 && landingVelocity < 4) {
      this.chainJumpCount++;
      return this.emit('perfect_landing', rating, 'Perfect landing!');
    }
    this.chainJumpCount = 0;
    return null;
  }

  onFastTurn(turnVelocity: number): ExpressionEvent | null {
    if (Math.abs(turnVelocity) < 4) return null;
    return this.emit('fast_turn', Math.min(1, Math.abs(turnVelocity) / 8), 'Sharp turn!');
  }

  onWallJump(): ExpressionEvent | null {
    return this.emit('wall_jump', 0.9, 'Wall jump!');
  }

  onChainJump(): ExpressionEvent | null {
    if (this.chainJumpCount < 2) return null;
    return this.emit('chain_jump', Math.min(1, this.chainJumpCount / 4), 'Chain combo!');
  }

  getRecent(): ExpressionEvent[] {
    return this.events.slice(-5);
  }

  getAverageIntensity(): number {
    if (this.events.length === 0) return 0;
    return this.events.reduce((s, e) => s + e.intensity, 0) / this.events.length;
  }

  private emit(type: ExpressionType, intensity: number, message: string): ExpressionEvent {
    const event: ExpressionEvent = {
      type,
      tick: this.tick,
      intensity: intensity * this.profile.expressionIntensity,
      message,
    };
    this.events.push(event);
    if (this.events.length > PERSONALITY_BUDGETS.maxExpressions) this.events.shift();
    return event;
  }
}
