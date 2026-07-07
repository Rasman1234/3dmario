import type { InputSnapshot, ReplayFile, LabSceneId } from '../types';
import type { MovementConfig } from '../../gameplay/MovementController';
import { RESEARCH_BUDGETS } from '../types';

/** Deterministic input replay recorder. */

export class ReplayRecorder {
  private frames: InputSnapshot[] = [];
  private recording = false;
  private seed = 1;
  private sceneId: LabSceneId = 'physics_isolation';
  private movementConfig: Partial<MovementConfig> = {};

  start(seed: number, sceneId: LabSceneId, movementConfig?: Partial<MovementConfig>): void {
    this.frames = [];
    this.seed = seed;
    this.sceneId = sceneId;
    this.movementConfig = movementConfig ?? {};
    this.recording = true;
  }

  recordInput(input: InputSnapshot): void {
    if (!this.recording) return;
    if (this.frames.length >= RESEARCH_BUDGETS.maxReplayFrames) return;
    this.frames.push({ ...input });
  }

  stop(): ReplayFile {
    this.recording = false;
    return {
      version: 1,
      seed: this.seed,
      sceneId: this.sceneId,
      fixedDt: 1 / 60,
      movementConfig: { ...this.movementConfig },
      frames: [...this.frames],
    };
  }

  isRecording(): boolean {
    return this.recording;
  }
}
