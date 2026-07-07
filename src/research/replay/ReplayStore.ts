import type { ReplayFile } from '../types';

/** In-memory replay store for golden replays and comparisons. */

export class ReplayStore {
  private readonly replays = new Map<string, ReplayFile>();

  save(id: string, replay: ReplayFile): void {
    this.replays.set(id, replay);
  }

  get(id: string): ReplayFile | undefined {
    return this.replays.get(id);
  }

  list(): string[] {
    return [...this.replays.keys()];
  }

  remove(id: string): boolean {
    return this.replays.delete(id);
  }
}
