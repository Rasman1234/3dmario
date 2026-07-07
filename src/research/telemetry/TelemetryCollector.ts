import type { TelemetryFrame } from '../types';
import { RESEARCH_BUDGETS } from '../types';

/** Frame-level gameplay telemetry collector. */

export class TelemetryCollector {
  private readonly buffer: TelemetryFrame[] = [];

  record(frame: TelemetryFrame): void {
    if (this.buffer.length >= RESEARCH_BUDGETS.maxFramesInMemory) {
      this.buffer.shift();
    }
    this.buffer.push(frame);
  }

  recordBatch(frames: TelemetryFrame[]): void {
    for (const f of frames) this.record(f);
  }

  getFrames(): TelemetryFrame[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer.length = 0;
  }

  getSeries(label: keyof TelemetryFrame): { tick: number; value: number }[] {
    return this.buffer.map((f) => ({
      tick: f.tick,
      value: typeof f[label] === 'number' ? (f[label] as number) : 0,
    }));
  }

  estimateMemoryBytes(): number {
    return this.buffer.length * 200;
  }
}
