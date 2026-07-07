import { describe, it, expect } from 'vitest';
import { ObjectPool } from './ObjectPool';
import type { IPoolable } from '../domain/interfaces';

class TestObject implements IPoolable {
  value = 0;
  reset(): void {
    this.value = 0;
  }
}

describe('ObjectPool', () => {
  it('acquires and releases objects', () => {
    const pool = new ObjectPool(() => new TestObject(), 2, 10);
    const a = pool.acquire();
    a.value = 42;
    expect(pool.activeCount).toBe(1);
    pool.release(a);
    expect(pool.activeCount).toBe(0);
    expect(a.value).toBe(0);
  });

  it('reuses released objects', () => {
    const pool = new ObjectPool(() => new TestObject(), 1, 10);
    const a = pool.acquire();
    pool.release(a);
    const b = pool.acquire();
    expect(b).toBe(a);
  });

  it('prewarms to requested count', () => {
    const pool = new ObjectPool(() => new TestObject(), 0, 10);
    pool.prewarm(5);
    expect(pool.availableCount).toBe(5);
  });

  it('drain clears all state', () => {
    const pool = new ObjectPool(() => new TestObject(), 2, 10);
    pool.acquire();
    pool.acquire();
    pool.drain();
    expect(pool.activeCount).toBe(0);
    expect(pool.availableCount).toBe(0);
  });
});
