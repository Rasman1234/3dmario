import type { MovementPreset } from './FeelConfig';
import type { GenomeEntry } from './MovementGenome';
import { compareToGolden } from './GoldenReplay';
import { FEEL_BUDGETS } from './FeelConfig';

export interface RegressionResult {
  timestamp: string;
  presetId: string;
  passed: boolean;
  reasons: string[];
  goldenPass: boolean;
  bestPresetDelta: number;
  latestPresetDelta: number;
  telemetryBaselineDelta: number;
}

export interface RegressionBaseline {
  bestRating: number;
  latestRating: number;
  telemetryAvgRating: number;
  positionHash?: string;
}

/** Compares code changes against best preset, latest preset, golden replay. */

export class MovementRegression {
  private baseline: RegressionBaseline = {
    bestRating: 0.65,
    latestRating: 0.65,
    telemetryAvgRating: 0.65,
  };
  private readonly history: RegressionResult[] = [];

  setBaseline(baseline: Partial<RegressionBaseline>): void {
    this.baseline = { ...this.baseline, ...baseline };
  }

  evaluate(params: {
    preset: MovementPreset;
    avgRating: number;
    positionHash?: string;
    metrics?: { jumpSuccessRate: number; avgLandingVelocity: number; maxJumpApex: number };
    bestGenome?: GenomeEntry;
    latestGenome?: GenomeEntry;
  }): RegressionResult {
    const reasons: string[] = [];
    let passed = true;

    const bestDelta = params.avgRating - (params.bestGenome?.avgJumpRating ?? this.baseline.bestRating);
    const latestDelta = params.avgRating - (params.latestGenome?.avgJumpRating ?? this.baseline.latestRating);
    const telemetryDelta = params.avgRating - this.baseline.telemetryAvgRating;

    if (bestDelta < -0.08) {
      passed = false;
      reasons.push(`Below best preset by ${Math.abs(bestDelta).toFixed(2)}`);
    }
    if (latestDelta < -0.05) {
      passed = false;
      reasons.push(`Below latest preset by ${Math.abs(latestDelta).toFixed(2)}`);
    }
    if (telemetryDelta < -0.1) {
      passed = false;
      reasons.push(`Telemetry baseline regression ${telemetryDelta.toFixed(2)}`);
    }

    let goldenPass = true;
    if (params.positionHash && params.metrics) {
      const golden = compareToGolden(params.positionHash, params.metrics);
      goldenPass = golden.pass;
      if (!golden.hashMatch && !golden.pass) {
        passed = false;
        reasons.push('Golden replay metrics failed');
      }
    }

    const result: RegressionResult = {
      timestamp: new Date().toISOString(),
      presetId: params.preset.id,
      passed,
      reasons,
      goldenPass,
      bestPresetDelta: bestDelta,
      latestPresetDelta: latestDelta,
      telemetryBaselineDelta: telemetryDelta,
    };

    this.history.push(result);
    if (this.history.length > FEEL_BUDGETS.maxRegressionHistory) this.history.shift();
    return result;
  }

  getHistory(): RegressionResult[] {
    return [...this.history];
  }

  getLastResult(): RegressionResult | undefined {
    return this.history[this.history.length - 1];
  }
}
