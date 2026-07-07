import type { GameEventMap } from '../domain/events';
import type { EventHandler, IEventBus } from '../domain/interfaces';

/** Typed publish/subscribe event bus for decoupled cross-system communication. */

type HandlerEntry = {
  handler: EventHandler<unknown>;
  once: boolean;
};

export class EventBus implements IEventBus {
  private readonly listeners = new Map<string, Set<HandlerEntry>>();

  on<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): () => void {
    return this.subscribe(event, handler, false);
  }

  once<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): () => void {
    return this.subscribe(event, handler, true);
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.listeners.get(event);
    if (!set) return;

    const toRemove: HandlerEntry[] = [];
    for (const entry of set) {
      entry.handler(payload);
      if (entry.once) toRemove.push(entry);
    }
    for (const entry of toRemove) {
      set.delete(entry);
    }
  }

  clear(): void {
    this.listeners.clear();
  }

  listenerCount(event?: keyof GameEventMap): number {
    if (event) return this.listeners.get(event)?.size ?? 0;
    let total = 0;
    for (const set of this.listeners.values()) total += set.size;
    return total;
  }

  private subscribe<K extends keyof GameEventMap>(
    event: K,
    handler: EventHandler<GameEventMap[K]>,
    once: boolean,
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const entry: HandlerEntry = {
      handler: handler as EventHandler<unknown>,
      once,
    };
    const set = this.listeners.get(event)!;
    set.add(entry);
    return () => set.delete(entry);
  }
}
