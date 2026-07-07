import type { MovementPreset } from './FeelConfig';
import type { JumpRecord } from './JumpTelemetry';
import { FEEL_BUDGETS } from './FeelConfig';

export interface GenomeEntry {
  presetId: string;
  label: string;
  jumpSuccessRate: number;
  avgJumpRating: number;
  sampleCount: number;
  movement: MovementPreset['movement'];
  recordedAt: string;
}

/** Stores every successful movement preset (rating ≥ threshold). */

export class MovementGenome {
  private readonly entries = new Map<string, GenomeEntry>();
  private readonly minRating = 0.65;

  record(preset: MovementPreset, jumps: JumpRecord[]): GenomeEntry | null {
    if (jumps.length === 0) return null;
    const avg = jumps.reduce((s, j) => s + j.rating, 0) / jumps.length;
    if (avg < this.minRating) return null;

    const entry: GenomeEntry = {
      presetId: preset.id,
      label: preset.label,
      jumpSuccessRate: preset.jumpSuccessRate,
      avgJumpRating: Math.round(avg * 100) / 100,
      sampleCount: jumps.length,
      movement: { ...preset.movement },
      recordedAt: new Date().toISOString(),
    };

    this.entries.set(preset.id, entry);
    this.trim();
    return entry;
  }

  getBest(): GenomeEntry | undefined {
    return [...this.entries.values()].sort((a, b) => b.avgJumpRating - a.avgJumpRating)[0];
  }

  getLatest(): GenomeEntry | undefined {
    return [...this.entries.values()].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime(),
    )[0];
  }

  list(): GenomeEntry[] {
    return [...this.entries.values()];
  }

  private trim(): void {
    while (this.entries.size > FEEL_BUDGETS.maxGenomeEntries) {
      const oldest = this.getLatest();
      if (oldest) this.entries.delete(oldest.presetId);
      else break;
    }
  }
}
