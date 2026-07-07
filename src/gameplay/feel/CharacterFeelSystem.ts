import type { MovementConfig, FeelMovementBridge } from '../MovementConfig';
import { MovementState } from '../MovementState';
import type { FeelConfig, MovementPreset } from './FeelConfig';
import { loadActivePreset, getAllPresets, DEFAULT_FEEL_CONFIG } from './FeelConfig';
import {
  createFeelState,
  type FeelMechanicsState,
  applyGroundMovementCurved,
  applyAirMovementCurved,
  applyCornerCorrection,
  applyGroundSnap,
  applyLedgeSnap,
  applyApexHang,
  applyFastFall,
  applySlopeHandling,
  applyPlatformTransfer,
  startLandingRecovery,
  landingRecoveryScale,
  tickFeelState,
} from './FeelMechanics';
import { JumpTelemetry, type JumpRecord } from './JumpTelemetry';
import { MovementGenome } from './MovementGenome';
import { MovementRegression, type RegressionResult } from './MovementRegression';
import { PlayerFeedbackCollector } from './PlayerFeedback';
import { GOLDEN_REPLAY } from './GoldenReplay';

export interface FeelSnapshot {
  preset: MovementPreset;
  feel: FeelConfig;
  avgJumpRating: number;
  latestJump?: JumpRecord;
  regression?: RegressionResult;
  genomeCount: number;
  feedbackScore: number;
  corrections: number;
  apexHang: boolean;
}

/** Phase 18 — Character Feel System (gameplay layer). */

export class CharacterFeelSystem {
  readonly telemetry = new JumpTelemetry();
  readonly genome = new MovementGenome();
  readonly regression = new MovementRegression();
  readonly feedback = new PlayerFeedbackCollector();

  feel: FeelConfig;
  preset: MovementPreset;
  readonly mechanicsState: FeelMechanicsState = createFeelState();

  private wasAirborne = false;
  private jumpStarted = false;
  private readonly presetRatings = new Map<string, JumpRecord[]>();

  constructor(private movement: FeelMovementBridge) {
    const loaded = loadActivePreset();
    this.feel = loaded.feel;
    this.preset = loaded.preset;
    this.applyMovementOverrides(loaded.movement);
    this.regression.setBaseline({
      bestRating: loaded.preset.jumpSuccessRate,
      latestRating: loaded.preset.jumpSuccessRate,
      telemetryAvgRating: 0.65,
    });
  }

  applyPreset(presetId: string): boolean {
    const preset = getAllPresets().find((p) => p.id === presetId);
    if (!preset) return false;
    this.preset = preset;
    this.feel = { ...DEFAULT_FEEL_CONFIG, presetId: preset.id };
    this.applyMovementOverrides(preset.movement);
    this.telemetry.clear();
    return true;
  }

  comparePresets(): { presetId: string; label: string; avgRating: number; labRank: number }[] {
    return getAllPresets().map((p) => {
      const jumps = this.presetRatings.get(p.id) ?? [];
      const avg = jumps.length > 0 ? jumps.reduce((s, j) => s + j.rating, 0) / jumps.length : p.jumpSuccessRate;
      return { presetId: p.id, label: p.label, avgRating: avg, labRank: p.labRank };
    });
  }

  preUpdate(dt: number, moveX: number, moveZ: number, _crouch: boolean): void {
    tickFeelState(this.mechanicsState, dt);
    this.telemetry.advanceTick();

    const m = this.movement;
    const airborne = !m.onGround;

    if (m.state === MovementState.Jump || m.state === MovementState.DoubleJump) {
      if (!this.jumpStarted) {
        this.telemetry.beginJump(m.position.y, this.mechanicsState.correctionsApplied);
        this.jumpStarted = true;
      }
      this.telemetry.sampleAirborne(m.position.y, this.feel.airControl);
    }

    if (this.wasAirborne && m.onGround && m.state === MovementState.Land) {
      const record = this.telemetry.endJump(Math.abs(m.velocity.y), this.feel);
      if (record) this.storeJumpRecord(record);
      this.jumpStarted = false;
      startLandingRecovery(this.mechanicsState, this.feel);
    }

    this.wasAirborne = airborne;

    if (!m.physicsDriven) {
      applyLedgeSnap(m.position, m.velocity, moveX, moveZ, m.onGround, this.feel, this.mechanicsState);
    }
  }

  applyGroundMovement(mx: number, mz: number, speed: number, dt: number): void {
    const recovery = landingRecoveryScale(this.mechanicsState, this.feel);
    applyGroundMovementCurved(
      this.movement.velocity,
      mx,
      mz,
      speed,
      dt,
      this.movement.config.acceleration,
      this.movement.config.deceleration,
      this.feel,
      recovery,
    );
  }

  applyAirMovement(mx: number, mz: number, dt: number): void {
    applyAirMovementCurved(
      this.movement.velocity,
      mx,
      mz,
      this.movement.config.runSpeed,
      dt,
      this.movement.config.airAcceleration,
      this.feel,
    );
  }

  postWallCollision(): void {
    applyCornerCorrection(
      this.movement.velocity,
      this.movement.wallNormal,
      this.movement.onWall,
      this.feel,
      this.mechanicsState,
    );
    if (this.movement.onWall) this.telemetry.addCorrection();
  }

  gravityMultiplier(crouch: boolean, grounded: boolean): number {
    const apex = applyApexHang(this.movement.velocity, this.feel, this.mechanicsState);
    const fast = applyFastFall(this.movement.velocity, crouch, grounded, this.feel);
    return apex * fast;
  }

  postGrounding(grounded: boolean, almostGrounded: boolean): void {
    applyGroundSnap(this.movement.velocity, grounded, almostGrounded, this.feel);
    applySlopeHandling(this.movement.velocity, grounded, this.feel, this.mechanicsState);
    applyPlatformTransfer(this.movement.velocity, grounded, this.feel, this.mechanicsState);
  }

  runRegressionCheck(): RegressionResult {
    const avg = this.telemetry.getAverageRating();
    const result = this.regression.evaluate({
      preset: this.preset,
      avgRating: avg,
      bestGenome: this.genome.getBest(),
      latestGenome: this.genome.getLatest(),
    });
    this.genome.record(this.preset, this.telemetry.getLog());
    return result;
  }

  snapshot(): FeelSnapshot {
    return {
      preset: this.preset,
      feel: this.feel,
      avgJumpRating: this.telemetry.getAverageRating(),
      latestJump: this.telemetry.getLatest(),
      regression: this.regression.getLastResult(),
      genomeCount: this.genome.list().length,
      feedbackScore: this.feedback.getSatisfactionScore(),
      corrections: this.mechanicsState.correctionsApplied,
      apexHang: this.mechanicsState.apexHangActive,
    };
  }

  getGoldenPresetId(): string {
    return GOLDEN_REPLAY.presetId;
  }

  private applyMovementOverrides(overrides: Partial<MovementConfig>): void {
    Object.assign(this.movement.config, overrides);
    this.movement.inputBuffer.reset();
  }

  private storeJumpRecord(record: JumpRecord): void {
    const list = this.presetRatings.get(record.presetId) ?? [];
    list.push(record);
    this.presetRatings.set(record.presetId, list);
  }
}
