import type { FalsificationScenario, ExperimentSpec } from '../types';
import { MovementSandbox, forwardJumpSequence } from '../sandbox/MovementSandbox';
import type { MovementConfig } from '../../gameplay/MovementController';
import type { HypothesisRegistry } from '../experiments/HypothesisRegistry';

export interface FalsificationResult {
  falsifierId: string;
  scenario: FalsificationScenario;
  passed: boolean;
  metric: number;
  description: string;
  critical: boolean;
}

const SCENARIO_OVERRIDES: Record<FalsificationScenario, Partial<MovementConfig> & { latencyMs?: number }> = {
  high_gravity: { gravity: 40 },
  low_friction: { deceleration: 5, acceleration: 10 },
  extreme_jump_timing: { jumpForce: 6, coyoteTime: 0.02 },
  high_latency: { latencyMs: 100 },
  low_fps: { latencyMs: 50 },
  bad_camera: {},
};

/** Execute predefined failure scenarios for falsification. */

export class FalsificationRunner {
  private readonly sandbox = new MovementSandbox();

  async runScenario(
    scenario: FalsificationScenario,
    sceneId: ExperimentSpec['sceneId'],
    seed = 42,
  ): Promise<FalsificationResult> {
    const overrides = { ...SCENARIO_OVERRIDES[scenario] };
    const latencyMs = overrides.latencyMs ?? 0;
    delete (overrides as { latencyMs?: number }).latencyMs;

    await this.sandbox.init();
    this.sandbox.setSeed(seed);
    await this.sandbox.loadSceneAsync(sceneId, overrides);
    this.sandbox.setLatencyInject(latencyMs);
    if (scenario === 'low_friction') this.sandbox.setFrictionScale(0.3);

    const { metrics } = this.sandbox.runSequence(forwardJumpSequence(180), 180);

    const passed =
      scenario === 'high_gravity'
        ? metrics.jumpSuccessRate < 0.9
        : scenario === 'extreme_jump_timing'
          ? metrics.missedJumpRate > 0.1 || metrics.deathCount > 0
          : metrics.jumpSuccessRate >= 0;

    return {
      falsifierId: `FALS-${scenario}`,
      scenario,
      passed,
      metric: metrics.jumpSuccessRate,
      description: `Scenario ${scenario}: jumpSuccess=${metrics.jumpSuccessRate.toFixed(2)} deaths=${metrics.deathCount}`,
      critical: false,
    };
  }

  async runAllForHypothesis(
    hypotheses: HypothesisRegistry,
    hypothesisId: string,
    sceneId: ExperimentSpec['sceneId'],
  ): Promise<FalsificationResult[]> {
    const hyp = hypotheses.get(hypothesisId);
    if (!hyp) return [];
    const results: FalsificationResult[] = [];
    for (const f of hyp.falsifiers) {
      const result = await this.runScenario(f.scenario, sceneId);
      results.push({ ...result, falsifierId: f.id, critical: f.critical });
    }
    return results;
  }

  survived(results: FalsificationResult[], criticalOnly = true): boolean {
    const filtered = criticalOnly ? results.filter((r) => r.critical) : results;
    if (filtered.length === 0) return true;
    return filtered.every((r) => r.passed);
  }

  dispose(): void {
    this.sandbox.dispose();
  }
}
