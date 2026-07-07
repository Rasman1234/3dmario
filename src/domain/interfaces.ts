/** Core system contracts — implemented by infrastructure and core layers. */

import type { EngineConfig, GameSettings, SaveData } from './types';
import type { GameEventMap } from './events';

// ─── Event Bus ─────────────────────────────────────────────────────────────────

export type EventHandler<T> = (payload: T) => void;

export interface IEventBus {
  on<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): () => void;
  once<K extends keyof GameEventMap>(event: K, handler: EventHandler<GameEventMap[K]>): () => void;
  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void;
  clear(): void;
}

// ─── Configuration ─────────────────────────────────────────────────────────────

export interface IConfigProvider {
  getEngineConfig(): EngineConfig;
  getSettings(): GameSettings;
  updateSettings(partial: Partial<GameSettings>): GameSettings;
  reload(): Promise<void>;
}

// ─── Save System ───────────────────────────────────────────────────────────────

export interface ISaveStore {
  load(slot?: number): SaveData;
  save(data: SaveData, slot?: number): void;
  hasSave(slot?: number): boolean;
  delete(slot?: number): void;
  migrate(data: unknown): SaveData;
}

// ─── Object Pool ───────────────────────────────────────────────────────────────

export interface IPoolable {
  reset(): void;
}

export interface IObjectPool<T extends IPoolable> {
  acquire(): T;
  release(item: T): void;
  prewarm(count: number): void;
  get activeCount(): number;
  get availableCount(): number;
  drain(): void;
}

// ─── Game Loop ─────────────────────────────────────────────────────────────────

export type UpdateCallback = (dt: number) => void;
export type RenderCallback = (alpha: number, frameDt: number) => void;

export interface IGameLoop {
  onUpdate(cb: UpdateCallback): void;
  onRender(cb: RenderCallback): void;
  start(): void;
  stop(): void;
  readonly isRunning: boolean;
  readonly fixedDt: number;
}

// ─── State Machine ─────────────────────────────────────────────────────────────

export interface IStateMachine<TState extends string> {
  readonly current: TState;
  is(...states: TState[]): boolean;
  canTransition(to: TState): boolean;
  transition(to: TState): boolean;
  force(to: TState): void;
}

// ─── Service Locator ───────────────────────────────────────────────────────────

export interface IServiceLocator {
  register<T>(key: string, instance: T): void;
  get<T>(key: string): T;
  tryGet<T>(key: string): T | undefined;
  has(key: string): boolean;
  clear(): void;
}

// ─── Disposable ────────────────────────────────────────────────────────────────

export interface IDisposable {
  dispose(): void;
}

// ─── Tickable ──────────────────────────────────────────────────────────────────

export interface ITickable {
  update(dt: number): void;
}

export interface IFixedTickable {
  fixedUpdate(dt: number): void;
}

export interface IRenderable {
  render(alpha: number, frameDt: number): void;
}
