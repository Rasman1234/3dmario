import type { HypothesisRecord, FalsifierSpec } from '../types';

const DEFAULT_FALSIFIERS: FalsifierSpec[] = [
  { id: 'f-high-gravity', description: 'High gravity breaks jump arc', scenario: 'high_gravity', critical: true },
  { id: 'f-extreme-timing', description: 'Extreme jump timing fails', scenario: 'extreme_jump_timing', critical: true },
  { id: 'f-high-latency', description: 'Input latency degrades success', scenario: 'high_latency', critical: false },
];

/** HYP registry — loads and tracks research hypotheses. */

export class HypothesisRegistry {
  private readonly hypotheses = new Map<string, HypothesisRecord>();

  register(hyp: HypothesisRecord): void {
    if (!hyp.falsifiers.length) {
      hyp.falsifiers = [...DEFAULT_FALSIFIERS];
    }
    this.hypotheses.set(hyp.id, { ...hyp });
  }

  get(id: string): HypothesisRecord | undefined {
    return this.hypotheses.get(id);
  }

  list(): HypothesisRecord[] {
    return [...this.hypotheses.values()];
  }

  updatePosterior(id: string, posterior: number, ciLow: number, ciHigh: number): void {
    const h = this.hypotheses.get(id);
    if (!h) return;
    h.posterior = posterior;
    h.ciLow = ciLow;
    h.ciHigh = ciHigh;
    if (posterior >= 0.75 && ciHigh - ciLow <= 0.25) h.status = 'supported';
    else if (posterior <= 0.3) h.status = 'refuted';
    else if (posterior > 0.3 && posterior < 0.75) h.status = 'testing';
  }

  addExperiment(id: string, experimentId: string): void {
    const h = this.hypotheses.get(id);
    if (h && !h.experimentIds.includes(experimentId)) {
      h.experimentIds.push(experimentId);
    }
  }

  static createDefaultM1(): HypothesisRecord {
    return {
      id: 'HYP-M1-feel',
      statement: 'Default jump parameters produce ≥70% jump success in gap laboratory',
      nullHypothesis: 'Jump success rate ≤50% on gap laboratory forward sequence',
      metric: 'jumpSuccessRate',
      targetDirection: 'increase',
      prior: 0.5,
      posterior: 0.5,
      ciLow: 0.35,
      ciHigh: 0.65,
      status: 'open',
      falsifiers: [...DEFAULT_FALSIFIERS],
      alternatives: [
        'Low gravity causes floaty jumps',
        'Gap spacing too wide for current jump force',
        'Coyote time insufficient for human-like input',
      ],
      experimentIds: [],
    };
  }
}
