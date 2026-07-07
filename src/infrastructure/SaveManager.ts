import type { ISaveStore } from '../domain/interfaces';
import type { SaveData } from '../domain/types';
import {
  DEFAULT_CHARACTER_STATS,
  DEFAULT_SETTINGS,
  SAVE_VERSION,
} from '../domain/types';

const STORAGE_KEY = '3dmario_save';

/** In-memory fallback when localStorage is unavailable (tests, SSR). */
const memoryStore = new Map<string, string>();

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
}

/** Versioned local persistence — cloud-save ready via ISaveStore abstraction. */

export class SaveManager implements ISaveStore {
  private readonly slot: number;

  constructor(slot = 0) {
    this.slot = slot;
  }

  private key(): string {
    return `${STORAGE_KEY}_${this.slot}`;
  }

  load(): SaveData {
    const raw = storageGet(this.key());
    if (!raw) return this.createDefault();
    try {
      const parsed = JSON.parse(raw) as unknown;
      return this.migrate(parsed);
    } catch {
      return this.createDefault();
    }
  }

  save(data: SaveData): void {
    const payload: SaveData = {
      ...data,
      version: SAVE_VERSION,
      savedAt: Date.now(),
    };
    storageSet(this.key(), JSON.stringify(payload));
  }

  hasSave(): boolean {
    return storageGet(this.key()) !== null;
  }

  delete(): void {
    storageRemove(this.key());
  }

  migrate(data: unknown): SaveData {
    if (!data || typeof data !== 'object') return this.createDefault();
    const record = data as Partial<SaveData>;
    const version = typeof record.version === 'number' ? record.version : 0;

    if (version < SAVE_VERSION) {
      return this.migrateFromLegacy(record);
    }

    return {
      version: SAVE_VERSION,
      settings: { ...DEFAULT_SETTINGS, ...record.settings },
      progress: {
        currentWorldId: record.progress?.currentWorldId ?? null,
        currentLevelId: record.progress?.currentLevelId ?? null,
        unlockedWorlds: record.progress?.unlockedWorlds ?? ['grassland'],
        completedLevels: record.progress?.completedLevels ?? [],
        collectedStars: record.progress?.collectedStars ?? {},
        totalCoins: record.progress?.totalCoins ?? 0,
        stats: { ...DEFAULT_CHARACTER_STATS, ...record.progress?.stats },
      },
      statistics: {
        totalPlayTime: record.statistics?.totalPlayTime ?? 0,
        totalDeaths: record.statistics?.totalDeaths ?? 0,
        totalJumps: record.statistics?.totalJumps ?? 0,
        totalEnemiesDefeated: record.statistics?.totalEnemiesDefeated ?? 0,
        totalCoinsCollected: record.statistics?.totalCoinsCollected ?? 0,
        totalStarsCollected: record.statistics?.totalStarsCollected ?? 0,
        levelsCompleted: record.statistics?.levelsCompleted ?? 0,
        bossesDefeated: record.statistics?.bossesDefeated ?? 0,
      },
      achievements: record.achievements ?? [],
      inventory: record.inventory ?? [],
      lastCheckpoint: record.lastCheckpoint ?? null,
      savedAt: record.savedAt ?? Date.now(),
    };
  }

  createDefault(): SaveData {
    return {
      version: SAVE_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      progress: {
        currentWorldId: null,
        currentLevelId: null,
        unlockedWorlds: ['grassland'],
        completedLevels: [],
        collectedStars: {},
        totalCoins: 0,
        stats: { ...DEFAULT_CHARACTER_STATS },
      },
      statistics: {
        totalPlayTime: 0,
        totalDeaths: 0,
        totalJumps: 0,
        totalEnemiesDefeated: 0,
        totalCoinsCollected: 0,
        totalStarsCollected: 0,
        levelsCompleted: 0,
        bossesDefeated: 0,
      },
      achievements: [],
      inventory: [],
      lastCheckpoint: null,
      savedAt: Date.now(),
    };
  }

  private migrateFromLegacy(record: Partial<SaveData>): SaveData {
    const base = this.createDefault();
    if (record.settings) base.settings = { ...base.settings, ...record.settings };
    if (record.progress) {
      base.progress = {
        ...base.progress,
        ...record.progress,
        stats: { ...DEFAULT_CHARACTER_STATS, ...record.progress.stats },
      };
    }
    if (record.statistics) base.statistics = { ...base.statistics, ...record.statistics };
    if (record.achievements) base.achievements = record.achievements;
    if (record.inventory) base.inventory = record.inventory;
    base.version = SAVE_VERSION;
    return base;
  }
}
