/** High-resolution time utilities for frame pacing and profiling. */

export class Time {
  private static _scale = 1;
  private static _paused = false;
  private static _pauseStart = 0;
  private static _totalPaused = 0;

  static get scale(): number {
    return this._scale;
  }

  static set scale(value: number) {
    this._scale = Math.max(0, value);
  }

  static get paused(): boolean {
    return this._paused;
  }

  static pause(): void {
    if (this._paused) return;
    this._paused = true;
    this._pauseStart = performance.now();
  }

  static resume(): void {
    if (!this._paused) return;
    this._totalPaused += performance.now() - this._pauseStart;
    this._paused = false;
  }

  static scaledDelta(rawDt: number): number {
    if (this._paused) return 0;
    return rawDt * this._scale;
  }

  static now(): number {
    const t = performance.now() - this._totalPaused;
    return this._paused ? this._pauseStart - this._totalPaused : t;
  }

  static reset(): void {
    this._scale = 1;
    this._paused = false;
    this._pauseStart = 0;
    this._totalPaused = 0;
  }
}
