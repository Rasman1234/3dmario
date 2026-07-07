import type { EvidenceArtifact, LabMetrics } from '../types';

let evdCounter = 0;

export interface EvidenceInput {
  hypothesisId: string;
  experimentId: string;
  metrics: LabMetrics;
  posterior: number;
  ciLow: number;
  ciHigh: number;
  conclusion: EvidenceArtifact['conclusion'];
}

/** Auto-generate EVD artifacts from telemetry — no manual editing. */

export class EvidencePipeline {
  private readonly artifacts: EvidenceArtifact[] = [];

  generate(input: EvidenceInput): EvidenceArtifact {
    evdCounter++;
    const artifact: EvidenceArtifact = {
      id: `EVD-${Date.now()}-${evdCounter}`,
      hypothesisId: input.hypothesisId,
      experimentId: input.experimentId,
      timestamp: new Date().toISOString(),
      conclusion: input.conclusion,
      metrics: { ...input.metrics },
      posterior: input.posterior,
      ciLow: input.ciLow,
      ciHigh: input.ciHigh,
      rawSummary: this.summarize(input),
    };
    this.artifacts.push(artifact);
    return artifact;
  }

  list(): EvidenceArtifact[] {
    return [...this.artifacts];
  }

  get(id: string): EvidenceArtifact | undefined {
    return this.artifacts.find((a) => a.id === id);
  }

  exportJson(): string {
    return JSON.stringify(this.artifacts, null, 2);
  }

  private summarize(input: EvidenceInput): string {
    const m = input.metrics;
    return [
      `jumpSuccess=${m.jumpSuccessRate.toFixed(3)}`,
      `missed=${m.missedJumpRate.toFixed(3)}`,
      `deaths=${m.deathCount}`,
      `recoveries=${m.recoveryCount}`,
      `posterior=${input.posterior.toFixed(3)}`,
      `CI=[${input.ciLow.toFixed(3)},${input.ciHigh.toFixed(3)}]`,
      `conclusion=${input.conclusion}`,
    ].join('; ');
  }
}
