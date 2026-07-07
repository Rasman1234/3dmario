import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from './SaveManager';
import { SAVE_VERSION } from '../domain/types';

describe('SaveManager', () => {
  let save: SaveManager;

  beforeEach(() => {
    save = new SaveManager(99);
    save.delete();
  });

  it('creates default save when none exists', () => {
    const data = save.load();
    expect(data.version).toBe(SAVE_VERSION);
    expect(data.progress.unlockedWorlds).toContain('grassland');
    expect(data.progress.stats.health).toBe(3);
  });

  it('persists and reloads save data', () => {
    const data = save.load();
    data.progress.totalCoins = 500;
    save.save(data);
    const loaded = save.load();
    expect(loaded.progress.totalCoins).toBe(500);
    expect(save.hasSave()).toBe(true);
  });

  it('migrates legacy saves without version', () => {
    const legacy = { settings: { musicVolume: 0.3 } };
    const migrated = save.migrate(legacy);
    expect(migrated.version).toBe(SAVE_VERSION);
    expect(migrated.settings.musicVolume).toBe(0.3);
  });

  it('handles corrupt data gracefully', () => {
    const migrated = save.migrate(null);
    expect(migrated.version).toBe(SAVE_VERSION);
  });
});
