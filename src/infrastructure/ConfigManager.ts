import type { IConfigProvider } from '../domain/interfaces';
import type { EngineConfig, GameSettings } from '../domain/types';
import { DEFAULT_ENGINE_CONFIG, DEFAULT_SETTINGS } from '../domain/types';
import engineConfig from '../data/engine.json';

/** JSON-driven configuration with runtime overrides. */

export class ConfigManager implements IConfigProvider {
  private engine: EngineConfig;
  private settings: GameSettings;

  constructor(settings?: Partial<GameSettings>) {
    this.engine = { ...DEFAULT_ENGINE_CONFIG, ...engineConfig } as EngineConfig;
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  getEngineConfig(): EngineConfig {
    return { ...this.engine };
  }

  getSettings(): GameSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<GameSettings>): GameSettings {
    this.settings = { ...this.settings, ...partial };
    return this.getSettings();
  }

  async reload(): Promise<void> {
    this.engine = { ...DEFAULT_ENGINE_CONFIG, ...engineConfig } as EngineConfig;
  }
}
