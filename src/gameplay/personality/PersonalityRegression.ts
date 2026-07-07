import goldenData from '../../data/personality-golden.json';
import type { JumpRecord } from '../feel/JumpTelemetry';
import type { ExpressionEvent } from './ExpressionSystem';

export interface PersonalityRegressionResult {
  passed: boolean;
  reasons: string[];
  animationTimingDelta: number;
  landingFeelDelta: number;
  jumpFeelDelta: number;
  expressionDelta: number;
  telemetryDelta: number;
  playerRatingDelta: number;
}

const GOLDEN = goldenData;

/** Feel regression — animation timing, landing, jump, expression, telemetry, ratings. */

export class PersonalityRegression {
  evaluate(params: {
    animationTiming: Record<string, number>;
    avgJumpRating: number;
    expressionAvg: number;
    playerRating: number;
    landingShake?: number;
  }): PersonalityRegressionResult {
    const reasons: string[] = [];
    let passed = true;

    const animDelta =
      (params.animationTiming.land ?? 0.1) - GOLDEN.animationTiming.land;
    const landingDelta = (params.landingShake ?? GOLDEN.landingFeel.cameraShake) - GOLDEN.landingFeel.cameraShake;
    const jumpDelta = params.avgJumpRating - GOLDEN.telemetryAvg;
    const expressionDelta = params.expressionAvg - GOLDEN.expressionAvg;
    const telemetryDelta = params.avgJumpRating - GOLDEN.telemetryAvg;
    const playerDelta = params.playerRating - GOLDEN.playerRatingAvg;

    if (Math.abs(animDelta) > 0.04) {
      passed = false;
      reasons.push(`Animation timing drift ${animDelta.toFixed(3)}s`);
    }
    if (jumpDelta < -0.1) {
      passed = false;
      reasons.push(`Jump feel regression ${jumpDelta.toFixed(2)}`);
    }
    if (expressionDelta < -0.15) {
      passed = false;
      reasons.push(`Expression regression ${expressionDelta.toFixed(2)}`);
    }
    if (telemetryDelta < -0.1) {
      passed = false;
      reasons.push(`Telemetry regression ${telemetryDelta.toFixed(2)}`);
    }
    if (playerDelta < -0.5) {
      passed = false;
      reasons.push(`Player rating regression ${playerDelta.toFixed(1)}`);
    }

    return {
      passed,
      reasons,
      animationTimingDelta: animDelta,
      landingFeelDelta: landingDelta,
      jumpFeelDelta: jumpDelta,
      expressionDelta,
      telemetryDelta,
      playerRatingDelta: playerDelta,
    };
  }

  compareJumps(jumps: JumpRecord[]): boolean {
    if (jumps.length === 0) return true;
    const avg = jumps.reduce((s, j) => s + j.rating, 0) / jumps.length;
    return avg >= GOLDEN.telemetryAvg - 0.1;
  }

  compareExpressions(events: ExpressionEvent[]): boolean {
    if (events.length === 0) return true;
    const avg = events.reduce((s, e) => s + e.intensity, 0) / events.length;
    return avg >= GOLDEN.expressionAvg - 0.15;
  }
}
