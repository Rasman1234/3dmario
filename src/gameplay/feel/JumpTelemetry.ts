import type { FeelConfig } from './FeelConfig';
import { FEEL_BUDGETS } from './FeelConfig';

export interface JumpRecord {
  id: string;
  takeoffTick: number;
  apexTick: number;
  landingTick: number;
  duration: number;
  apexHeight: number;
  airControlScore: number;
  correctionCount: number;
  landingVelocity: number;
  rating: number;
  presetId: string;
}

export interface ActiveJump {
  takeoffTick: number;
  takeoffY: number;
  maxY: number;
  airControlSamples: number;
  airControlSum: number;
  correctionCount: number;
}

/** Per-jump telemetry — takeoff, apex, landing, rating. */

export class JumpTelemetry {
  private readonly log: JumpRecord[] = [];
  private active: ActiveJump | null = null;
  private tick = 0;

  beginJump(takeoffY: number, corrections: number): void {
    this.active = {
      takeoffTick: this.tick,
      takeoffY,
      maxY: takeoffY,
      airControlSamples: 0,
      airControlSum: 0,
      correctionCount: corrections,
    };
  }

  sampleAirborne(y: number, airControl: number): void {
    if (!this.active) return;
    if (y > this.active.maxY) this.active.maxY = y;
    this.active.airControlSamples++;
    this.active.airControlSum += airControl;
  }

  addCorrection(): void {
    if (this.active) this.active.correctionCount++;
  }

  endJump(landingVelocity: number, feel: FeelConfig): JumpRecord | null {
    if (!this.active) return null;
    const a = this.active;
    this.active = null;
    const apexHeight = a.maxY - a.takeoffY;
    const duration = (this.tick - a.takeoffTick) / 240;
    const airControlScore =
      a.airControlSamples > 0 ? a.airControlSum / a.airControlSamples : 0;
    const correctionScore = Math.min(1, a.correctionCount / 3);
    const landingScore = Math.max(0, 1 - landingVelocity / 12);
    const apexScore = Math.min(1, apexHeight / 4);
    const durationScore = Math.min(1, duration / 0.6);
    const w = feel.jumpRatingWeights;
    const rating =
      apexScore * w.apex +
      durationScore * w.duration +
      airControlScore * w.airControl +
      correctionScore * w.correction +
      landingScore * w.landing;

    const record: JumpRecord = {
      id: `JMP-${this.tick}-${this.log.length}`,
      takeoffTick: a.takeoffTick,
      apexTick: a.takeoffTick + Math.round(duration * 120),
      landingTick: this.tick,
      duration,
      apexHeight,
      airControlScore,
      correctionCount: a.correctionCount,
      landingVelocity,
      rating: Math.round(rating * 100) / 100,
      presetId: feel.presetId,
    };

    if (this.log.length >= FEEL_BUDGETS.maxJumpLog) this.log.shift();
    this.log.push(record);
    return record;
  }

  advanceTick(): void {
    this.tick++;
  }

  getLog(): JumpRecord[] {
    return [...this.log];
  }

  getLatest(): JumpRecord | undefined {
    return this.log[this.log.length - 1];
  }

  getAverageRating(): number {
    if (this.log.length === 0) return 0;
    return this.log.reduce((s, j) => s + j.rating, 0) / this.log.length;
  }

  clear(): void {
    this.log.length = 0;
    this.active = null;
    this.tick = 0;
  }
}
