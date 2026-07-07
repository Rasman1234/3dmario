import { describe, it, expect } from 'vitest';
import { ConfigManager } from './ConfigManager';
import { DEFAULT_SETTINGS } from '../domain/types';

describe('ConfigManager', () => {
  it('returns default settings', () => {
    const config = new ConfigManager();
    const settings = config.getSettings();
    expect(settings.musicVolume).toBe(DEFAULT_SETTINGS.musicVolume);
    expect(settings.graphicsQuality).toBe('high');
  });

  it('merges partial settings updates', () => {
    const config = new ConfigManager();
    const updated = config.updateSettings({ musicVolume: 0.5, bloomEnabled: false });
    expect(updated.musicVolume).toBe(0.5);
    expect(updated.bloomEnabled).toBe(false);
    expect(updated.sfxVolume).toBe(DEFAULT_SETTINGS.sfxVolume);
  });

  it('loads engine config from JSON', () => {
    const config = new ConfigManager();
    const engine = config.getEngineConfig();
    expect(engine.fixedTimestep).toBeCloseTo(1 / 240);
    expect(engine.simulationHz).toBe(240);
    expect(engine.renderHz).toBe(120);
    expect(engine.gravity.y).toBe(-24);
  });
});
