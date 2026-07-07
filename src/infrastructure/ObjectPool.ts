import type { IObjectPool, IPoolable } from '../domain/interfaces';

/** Generic object pool — avoids GC spikes for particles, projectiles, enemies. */

export class ObjectPool<T extends IPoolable> implements IObjectPool<T> {
  private readonly factory: () => T;
  private readonly maxSize: number;
  private readonly available: T[] = [];
  private readonly active = new Set<T>();

  constructor(factory: () => T, initialSize: number, maxSize: number) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.prewarm(initialSize);
  }

  acquire(): T {
    const item = this.available.pop() ?? this.factory();
    this.active.add(item);
    return item;
  }

  release(item: T): void {
    if (!this.active.has(item)) return;
    this.active.delete(item);
    item.reset();
    if (this.available.length < this.maxSize) {
      this.available.push(item);
    }
  }

  prewarm(count: number): void {
    const toCreate = Math.min(count, this.maxSize) - this.available.length;
    for (let i = 0; i < toCreate; i++) {
      this.available.push(this.factory());
    }
  }

  get activeCount(): number {
    return this.active.size;
  }

  get availableCount(): number {
    return this.available.length;
  }

  forEachActive(fn: (item: T) => void): void {
    for (const item of this.active) {
      fn(item);
    }
  }

  drain(): void {
    for (const item of this.active) {
      item.reset();
    }
    this.active.clear();
    this.available.length = 0;
  }
}
