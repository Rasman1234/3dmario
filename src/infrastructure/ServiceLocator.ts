import type { IServiceLocator } from '../domain/interfaces';

/** Lightweight service locator — composition root registers singletons here. */

export class ServiceLocator implements IServiceLocator {
  private static readonly services = new Map<string, unknown>();

  static register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  static get<T>(key: string): T {
    const svc = this.services.get(key);
    if (svc === undefined) {
      throw new Error(`Service not registered: ${key}`);
    }
    return svc as T;
  }

  static tryGet<T>(key: string): T | undefined {
    return this.services.get(key) as T | undefined;
  }

  static has(key: string): boolean {
    return this.services.has(key);
  }

  static clear(): void {
    this.services.clear();
  }

  register<T>(key: string, instance: T): void {
    ServiceLocator.register(key, instance);
  }

  get<T>(key: string): T {
    return ServiceLocator.get<T>(key);
  }

  tryGet<T>(key: string): T | undefined {
    return ServiceLocator.tryGet<T>(key);
  }

  has(key: string): boolean {
    return ServiceLocator.has(key);
  }

  clear(): void {
    ServiceLocator.clear();
  }
}

export const Services = {
  EVENT_BUS: 'eventBus',
  CONFIG: 'config',
  SAVE: 'save',
  GAME_LOOP: 'gameLoop',
  STATE_MACHINE: 'stateMachine',
} as const;
