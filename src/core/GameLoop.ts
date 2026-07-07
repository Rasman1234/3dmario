import type { IGameLoop, RenderCallback, UpdateCallback } from '../domain/interfaces';

/** Fixed timestep game loop with decoupled rendering — deterministic simulation core. */

export class GameLoop implements IGameLoop {
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private updateCallback: UpdateCallback | null = null;
  private renderCallback: RenderCallback | null = null;

  private renderAccumulator = 0;

  readonly fixedDt: number;
  private readonly maxFrameTime: number;
  private readonly renderDt: number;

  constructor(fixedDt = 1 / 60, maxFrameTime = 0.25, renderHz?: number) {
    this.fixedDt = fixedDt;
    this.maxFrameTime = maxFrameTime;
    this.renderDt = renderHz && renderHz > 0 ? 1 / renderHz : 0;
  }

  onUpdate(cb: UpdateCallback): void {
    this.updateCallback = cb;
  }

  onRender(cb: RenderCallback): void {
    this.renderCallback = cb;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  get isRunning(): boolean {
    return this.running;
  }

  /** Advance one fixed step — used by tests without RAF. */
  stepOnce(frameDt = this.fixedDt): void {
    this.updateCallback?.(this.fixedDt);
    this.renderCallback?.(1, frameDt);
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now() / 1000;
    let frameTime = now - this.lastTime;
    this.lastTime = now;

    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }

    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedDt) {
      this.updateCallback?.(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.renderAccumulator += frameTime;
    const shouldRender = this.renderDt <= 0 || this.renderAccumulator >= this.renderDt;
    if (shouldRender) {
      if (this.renderDt > 0) {
        while (this.renderAccumulator >= this.renderDt) this.renderAccumulator -= this.renderDt;
      }
      const alpha = this.accumulator / this.fixedDt;
      this.renderCallback?.(alpha, frameTime);
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}
