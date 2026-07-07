/** Typed event map — all cross-system communication flows through these events. */

import type {
  GameSettings,
  GameStateId,
  LevelId,
  Vec3,
  WorldId,
} from './types';

export type GameEventMap = {
  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  'app:boot': void;
  'app:ready': void;
  'app:shutdown': void;

  // ─── State Machine ─────────────────────────────────────────────────────────
  'state:changed': { from: GameStateId; to: GameStateId };

  // ─── Level Flow ────────────────────────────────────────────────────────────
  'level:load': { levelId: LevelId; worldId: WorldId };
  'level:loaded': { levelId: LevelId };
  'level:unload': { levelId: LevelId };
  'level:complete': { levelId: LevelId; stars: number; coins: number; time: number };

  // ─── Player ────────────────────────────────────────────────────────────────
  'player:spawn': { position: Vec3 };
  'player:respawn': { checkpointIndex: number };
  'player:death': { cause: string };
  'player:damaged': { amount: number; remaining: number };
  'player:healed': { amount: number; remaining: number };
  'player:stat_changed': { stat: string; value: number };

  // ─── Collectibles ──────────────────────────────────────────────────────────
  'coin:collected': { value: number; position: Vec3; total: number };
  'star:collected': { levelId: LevelId; index: number };
  'powerup:collected': { type: string; duration: number };
  'item:pickup': { itemId: string };

  // ─── Combat ────────────────────────────────────────────────────────────────
  'enemy:defeated': { enemyId: string; type: string };
  'boss:phase_changed': { bossId: string; phase: number };
  'boss:defeated': { bossId: string };
  'attack:performed': { type: string; damage: number };

  // ─── Camera ────────────────────────────────────────────────────────────────
  'camera:mode_changed': { mode: string };
  'camera:shake': { intensity: number; duration: number };

  // ─── Audio ─────────────────────────────────────────────────────────────────
  'audio:play_sfx': { id: string; volume?: number };
  'audio:play_music': { id: string; fade?: number };
  'audio:stop_music': { fade?: number };

  // ─── UI ────────────────────────────────────────────────────────────────────
  'ui:show': { screen: string };
  'ui:hide': { screen: string };
  'ui:toast': { message: string; duration: number };

  // ─── Settings & Save ───────────────────────────────────────────────────────
  'settings:changed': { partial: Partial<GameSettings> };
  'save:requested': { manual: boolean };
  'save:completed': { slot: number };
  'save:loaded': { slot: number };

  // ─── Quest ─────────────────────────────────────────────────────────────────
  'quest:started': { questId: string };
  'quest:updated': { questId: string; progress: number; total: number };
  'quest:completed': { questId: string };

  // ─── Feel & Personality ────────────────────────────────────────────────────
  'feel:dust': { position: Vec3; count: number };
  'feel:haptic': { pattern: 'light' | 'medium' | 'heavy' };
  'feel:landing': { velocity: number; rating?: number; telemetryId?: string };

  // ─── Debug ─────────────────────────────────────────────────────────────────
  'debug:toggle': { feature: string; enabled: boolean };
  'perf:frame': { fps: number; drawCalls: number; triangles: number };
};

export type GameEventName = keyof GameEventMap;
