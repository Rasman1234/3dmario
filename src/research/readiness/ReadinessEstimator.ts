import type { ReadinessSnapshot, EvidenceArtifact, HypothesisRecord } from '../types';

/** Estimates R0–R4 readiness from existing models. */

export class ReadinessEstimator {
  estimate(params: {
    hypotheses: HypothesisRecord[];
    evidence: EvidenceArtifact[];
    determinismPass: boolean;
    labBootMs: number;
    falsificationComplete: boolean;
    reslogEntries: number;
    phase17Live: boolean;
  }): ReadinessSnapshot {
    const r1 = {
      hypRegistry: params.hypotheses.length >= 1,
      posteriorChain: params.hypotheses.some((h) => h.posterior !== h.prior),
      setUsed: params.hypotheses.some((h) => h.alternatives.length >= 2),
      xplComplete: params.evidence.length >= 1,
      failTaxonomy: true,
      reslog: params.reslogEntries >= 1,
      dashboard: params.phase17Live,
      expOpt: params.evidence.length >= 1,
    };

    const r2 = {
      labLive: params.phase17Live,
      evdCount: params.evidence.length >= 3,
      bayesianReal: params.hypotheses.some((h) => h.status === 'testing' || h.status === 'supported'),
      falsExecuted: params.falsificationComplete,
      refuted: params.hypotheses.some((h) => h.status === 'refuted'),
      determinism: params.determinismPass,
    };

    const researchScore = this.score(Object.values(r1)) * 0.4 + this.score(Object.values(r2)) * 0.6;
    const implementationScore = params.phase17Live && params.determinismPass ? 45 : 28;
    const gameplayScore = params.hypotheses.some((h) => h.posterior >= 0.6) ? 35 : 20;
    const sliceScore =
      params.hypotheses.find((h) => h.id === 'HYP-M1-feel')?.posterior ?? 0.5;

    return {
      researchReadiness: Math.round(researchScore * 100),
      implementationReadiness: implementationScore,
      gameplayReadiness: Math.round(gameplayScore),
      verticalSliceReadiness: Math.round(sliceScore * 60),
      details: { ...r1, ...r2, labBootMs: params.labBootMs < 2000 },
    };
  }

  private score(flags: boolean[]): number {
    if (flags.length === 0) return 0;
    return flags.filter(Boolean).length / flags.length;
  }
}
