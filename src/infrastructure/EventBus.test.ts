import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from './EventBus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('delivers events to subscribers', () => {
    const handler = vi.fn();
    bus.on('state:changed', handler);
    bus.emit('state:changed', { from: 'boot' as never, to: 'loading' as never });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('unsubscribes via returned function', () => {
    const handler = vi.fn();
    const unsub = bus.on('app:boot', handler);
    unsub();
    bus.emit('app:boot', undefined);
    expect(handler).not.toHaveBeenCalled();
  });

  it('once handlers fire only once', () => {
    const handler = vi.fn();
    bus.once('app:ready', handler);
    bus.emit('app:ready', undefined);
    bus.emit('app:ready', undefined);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('clear removes all listeners', () => {
    const handler = vi.fn();
    bus.on('app:boot', handler);
    bus.clear();
    bus.emit('app:boot', undefined);
    expect(handler).not.toHaveBeenCalled();
    expect(bus.listenerCount()).toBe(0);
  });
});
