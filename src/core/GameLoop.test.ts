import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from './GameLoop';

describe('GameLoop', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      return setTimeout(() => cb(performance.now()), 16) as unknown as number;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('invokes update and render on stepOnce', () => {
    const update = vi.fn();
    const render = vi.fn();
    const loop = new GameLoop(1 / 60);
    loop.onUpdate(update);
    loop.onRender(render);
    loop.stepOnce();
    expect(update).toHaveBeenCalledWith(1 / 60);
    expect(render).toHaveBeenCalledWith(1, 1 / 60);
  });

  it('uses configured fixed timestep', () => {
    const loop = new GameLoop(1 / 30);
    expect(loop.fixedDt).toBeCloseTo(1 / 30);
  });

  it('starts and stops', () => {
    const loop = new GameLoop();
    loop.start();
    expect(loop.isRunning).toBe(true);
    loop.stop();
    expect(loop.isRunning).toBe(false);
  });
});
