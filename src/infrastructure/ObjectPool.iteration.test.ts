import { describe, it, expect, vi } from 'vitest';
import { ObjectPool } from './ObjectPool';
import type { IPoolable } from '../domain/interfaces';

class TestItem implements IPoolable {
  value = 0;
  reset(): void { this.value = 0; }
}

describe('ObjectPool forEachActive', () => {
  it('iterates active items', () => {
    const pool = new ObjectPool(() => new TestItem(), 0, 10);
    const a = pool.acquire();
    const b = pool.acquire();
    a.value = 1;
    b.value = 2;
    const values: number[] = [];
    pool.forEachActive((item) => values.push(item.value));
    expect(values.sort()).toEqual([1, 2]);
  });

  it('does not iterate released items', () => {
    const pool = new ObjectPool(() => new TestItem(), 0, 10);
    const a = pool.acquire();
    pool.release(a);
    const fn = vi.fn();
    pool.forEachActive(fn);
    expect(fn).not.toHaveBeenCalled();
  });
});
