import type { ExplainableBundle } from '../types';

let xplCounter = 0;

export interface ExplainInput {
  experimentId: string;
  hypothesis: string;
  evidence: string[];
  alternatives: string[];
  confidenceBefore: number;
  confidenceAfter: number;
  ci: [number, number];
  recommendation: string;
  openQuestions?: string[];
}

/** Auto-generate explainable research bundles (XPL). */

export class ExplainableResults {
  private readonly bundles: ExplainableBundle[] = [];

  build(input: ExplainInput): ExplainableBundle {
    xplCounter++;
    const bundle: ExplainableBundle = {
      id: `XPL-${Date.now()}-${xplCounter}`,
      experimentId: input.experimentId,
      summary: `Experiment ${input.experimentId}: ${input.hypothesis}`,
      hypothesis: input.hypothesis,
      evidence: input.evidence,
      rejectedAlternatives: input.alternatives.slice(1).map((alt) => ({
        alternative: alt,
        reason: 'Lower posterior support than primary hypothesis',
      })),
      confidenceUpdate: {
        before: input.confidenceBefore,
        after: input.confidenceAfter,
        ci: input.ci,
      },
      remainingUncertainty: `CI width ${(input.ci[1] - input.ci[0]).toFixed(2)}; ${input.openQuestions?.join(', ') ?? 'More playtests needed'}`,
      recommendation: input.recommendation,
    };
    this.bundles.push(bundle);
    return bundle;
  }

  list(): ExplainableBundle[] {
    return [...this.bundles];
  }

  get(id: string): ExplainableBundle | undefined {
    return this.bundles.find((b) => b.id === id);
  }
}
