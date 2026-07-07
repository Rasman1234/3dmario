/** Fixed-timestep clock — no wall-clock dependency in simulation. */

export class DeterministicClock {
  private tick = 0;

  constructor(
    readonly fixedDt: number,
    readonly maxTicks: number,
  ) {}

  get currentTick(): number {
    return this.tick;
  }

  get elapsed(): number {
    return this.tick * this.fixedDt;
  }

  get done(): boolean {
    return this.tick >= this.maxTicks;
  }

  advance(): boolean {
    if (this.done) return false;
    this.tick++;
    return true;
  }

  reset(): void {
    this.tick = 0;
  }
}
