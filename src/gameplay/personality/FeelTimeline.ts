import { PERSONALITY_BUDGETS } from './types';

export type TimelineStage =
  | 'input'
  | 'animation'
  | 'physics'
  | 'camera'
  | 'audio'
  | 'fx'
  | 'telemetry';

export interface TimelineEntry {
  tick: number;
  stage: TimelineStage;
  detail: string;
  durationMs: number;
}

/** Visualizes complete feel sequence across pipeline stages. */

export class FeelTimeline {
  private readonly entries: TimelineEntry[] = [];
  private tick = 0;
  private stageStart = 0;

  advanceTick(): void {
    this.tick++;
  }

  mark(stage: TimelineStage, detail: string): void {
    const now = performance.now();
    const durationMs = this.stageStart > 0 ? now - this.stageStart : 0;
    this.entries.push({ tick: this.tick, stage, detail, durationMs });
    this.stageStart = now;
    if (this.entries.length > PERSONALITY_BUDGETS.maxTimelineEntries) this.entries.shift();
  }

  getFlow(): TimelineEntry[] {
    return [...this.entries];
  }

  getStageSummary(): Record<TimelineStage, number> {
    const summary: Record<TimelineStage, number> = {
      input: 0,
      animation: 0,
      physics: 0,
      camera: 0,
      audio: 0,
      fx: 0,
      telemetry: 0,
    };
    for (const e of this.entries) summary[e.stage]++;
    return summary;
  }

  renderAscii(): string {
    const order: TimelineStage[] = ['input', 'animation', 'physics', 'camera', 'audio', 'fx', 'telemetry'];
    return order.map((s) => {
      const count = this.entries.filter((e) => e.stage === s).length;
      return `${s}: ${'█'.repeat(Math.min(count, 12))}`;
    }).join('\n');
  }
}
