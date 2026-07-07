/** Performance optimization utilities — LOD, frustum culling helpers, instancing. */

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private lastTime = performance.now();

  tick(): number {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.frameTimes.push(dt);
    if (this.frameTimes.length > 120) this.frameTimes.shift();
    return dt;
  }

  get averageFps(): number {
    if (this.frameTimes.length === 0) return 60;
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return Math.round(1 / avg);
  }

  get p99FrameTime(): number {
    const sorted = [...this.frameTimes].sort((a, b) => b - a);
    return sorted[Math.floor(sorted.length * 0.01)] ?? 0;
  }
}

export class LODManager {
  private readonly distances = [20, 50, 100];

  getLOD(distance: number): 0 | 1 | 2 | 3 {
    if (distance < this.distances[0]!) return 0;
    if (distance < this.distances[1]!) return 1;
    if (distance < this.distances[2]!) return 2;
    return 3;
  }

  shouldRender(distance: number, maxDistance = 150): boolean {
    return distance < maxDistance;
  }
}
