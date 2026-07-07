import { MovementState } from '../../gameplay/MovementState';
import { GameplayPipeline } from '../../gameplay/GameplayPipeline';
import { MovementController, type MovementConfig } from '../../gameplay/MovementController';
import { PhysicsWorld } from '../../physics/PhysicsWorld';
import { GameplayOrchestrator } from '../../systems/GameplayOrchestrator';
import { EventBus } from '../../infrastructure/EventBus';
import { DeterministicClock } from '../DeterministicClock';
import { ResearchInputManager } from '../ResearchInputManager';
import type {
  InputSnapshot,
  LabFrame,
  LabMetrics,
  LabReport,
  LabSceneId,
  TelemetryFrame,
} from '../types';
import { RESEARCH_BUDGETS } from '../types';
import { getLabScene } from './LabScenes';

const PLAYER_ID = 'player';
const FIXED_DT = 1 / 60;

/** Deterministic movement research sandbox — shared orchestrator path. */

export class MovementSandbox {
  private readonly events = new EventBus();
  private readonly orchestrator = new GameplayOrchestrator(this.events);
  private readonly input = new ResearchInputManager();
  private physics: PhysicsWorld | null = null;
  private pipeline: GameplayPipeline | null = null;
  private sceneId: LabSceneId = 'physics_isolation';
  private seed = 1;
  private prevVelocity = { x: 0, y: 0, z: 0 };
  private jumpApex = 0;
  private jumpAttempts = 0;
  private jumpSuccesses = 0;
  private missedJumps = 0;
  private landingVelocities: number[] = [];
  private recoveryCount = 0;
  private deathCount = 0;
  private groundedTicks = 0;
  private totalTicks = 0;
  private latencyInjectMs = 0;

  async init(gravity = -24): Promise<void> {
    this.physics = await PhysicsWorld.create({ x: 0, y: gravity, z: 0 });
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }

  getSeed(): number {
    return this.seed;
  }

  async loadSceneAsync(id: LabSceneId, movementOverrides?: Partial<MovementConfig>): Promise<void> {
    if (!this.physics) await this.init();
    this.sceneId = id;
    const scene = getLabScene(id);
    if (this.physics) this.physics.dispose();
    await this.init(movementOverrides?.gravity ? -Math.abs(movementOverrides.gravity) : -24);
    if (!this.physics) throw new Error('Physics init failed');
    scene.setup(this.physics);
    const movement = new MovementController(movementOverrides);
    this.pipeline = new GameplayPipeline(movement);
    this.orchestrator.initPhysics(this.physics, this.pipeline, scene.spawn);
    this.resetMetrics();
  }

  applyMovementOverrides(overrides: Partial<MovementConfig>): void {
    if (!this.pipeline) return;
    Object.assign(this.pipeline.movement.config, overrides);
  }

  setLatencyInject(ms: number): void {
    this.latencyInjectMs = ms;
  }

  setFrictionScale(scale: number): void {
    if (this.pipeline && scale < 1) {
      this.pipeline.movement.config.deceleration *= scale;
      this.pipeline.movement.config.acceleration *= scale;
    }
  }

  stepFrame(input: InputSnapshot, tick: number): TelemetryFrame {
    if (!this.physics || !this.pipeline) {
      throw new Error('Sandbox scene not loaded');
    }

    const dt = FIXED_DT;
    if (this.latencyInjectMs > 0 && tick % Math.ceil(this.latencyInjectMs / (dt * 1000)) === 0) {
      return this.captureFrame(tick, dt, input, true);
    }

    this.input.setSnapshot(input);
    this.orchestrator.update(dt, this.input as never, this.pipeline, this.physics, null, null);
    this.input.update();

    const frame = this.captureFrame(tick, dt, input, false);
    this.updateMetrics(frame, input, tick);
    return frame;
  }

  runSequence(inputs: InputSnapshot[], maxTicks?: number): { frames: TelemetryFrame[]; metrics: LabMetrics } {
    const clock = new DeterministicClock(FIXED_DT, maxTicks ?? inputs.length);
    const frames: TelemetryFrame[] = [];
    let i = 0;

    while (clock.advance()) {
      const input = inputs[i] ?? inputs[inputs.length - 1] ?? idleInput();
      frames.push(this.stepFrame(input, clock.currentTick));
      i++;
      if (frames.length >= RESEARCH_BUDGETS.maxFramesInMemory) break;
    }

    return { frames, metrics: this.computeMetrics(frames) };
  }

  exportReport(frames: LabFrame[]): LabReport {
    const metrics = this.computeMetrics(frames as TelemetryFrame[]);
    return {
      sceneId: this.sceneId,
      seed: this.seed,
      fixedDt: FIXED_DT,
      frameCount: frames.length,
      duration: frames.length * FIXED_DT,
      frames,
      metrics,
      positionHash: hashPositions(frames),
    };
  }

  getMovementConfig(): MovementConfig | null {
    return this.pipeline?.movement.config ?? null;
  }

  dispose(): void {
    this.physics?.dispose();
    this.physics = null;
    this.pipeline = null;
  }

  private captureFrame(
    tick: number,
    dt: number,
    _input: InputSnapshot,
    latencySkipped: boolean,
  ): TelemetryFrame {
    const m = this.pipeline!.movement;
    const accel = {
      x: (m.velocity.x - this.prevVelocity.x) / dt,
      y: (m.velocity.y - this.prevVelocity.y) / dt,
      z: (m.velocity.z - this.prevVelocity.z) / dt,
    };
    this.prevVelocity = { ...m.velocity };

    if (m.velocity.y > this.jumpApex) this.jumpApex = m.velocity.y;

    const landingQuality =
      m.state === MovementState.Land ? Math.abs(m.velocity.y) : 0;

    return {
      tick,
      dt,
      position: { ...m.position },
      velocity: { ...m.velocity },
      acceleration: accel,
      grounded: m.onGround,
      onWall: m.onWall,
      state: m.state,
      jumpApex: this.jumpApex,
      landingVelocity: landingQuality,
      inputLatencyMs: latencySkipped ? this.latencyInjectMs : 0,
      cameraDistance: 8,
      cameraOcclusion: 0,
    };
  }

  private updateMetrics(frame: TelemetryFrame, input: InputSnapshot, _tick: number): void {
    this.totalTicks++;
    if (frame.grounded) this.groundedTicks++;

    if (input.jumpPressed) {
      this.jumpAttempts++;
    }

    if (frame.state === MovementState.Land) {
      this.jumpSuccesses++;
      this.landingVelocities.push(frame.landingVelocity);
      this.jumpApex = 0;
    }

    if (!frame.grounded && frame.position.y < -10) {
      this.deathCount++;
      this.missedJumps++;
      this.recoveryCount++;
      this.pipeline?.movement.reset(getLabScene(this.sceneId).spawn);
      if (this.physics) {
        this.physics.setPosition(PLAYER_ID, getLabScene(this.sceneId).spawn);
      }
    }
  }

  private computeMetrics(frames: TelemetryFrame[]): LabMetrics {
    const jumpSuccessRate =
      this.jumpAttempts > 0 ? this.jumpSuccesses / this.jumpAttempts : 0;
    const missedJumpRate =
      this.jumpAttempts > 0 ? this.missedJumps / this.jumpAttempts : 0;
    const avgLanding =
      this.landingVelocities.length > 0
        ? this.landingVelocities.reduce((a, b) => a + b, 0) / this.landingVelocities.length
        : 0;

    return {
      jumpCount: this.jumpAttempts,
      jumpSuccessRate,
      missedJumpRate,
      avgLandingVelocity: avgLanding,
      maxJumpApex: Math.max(...frames.map((f) => f.jumpApex), 0),
      deathCount: this.deathCount,
      recoveryCount: this.recoveryCount,
      completionTime: frames.length * FIXED_DT,
      groundedPercent: this.totalTicks > 0 ? this.groundedTicks / this.totalTicks : 0,
    };
  }

  private resetMetrics(): void {
    this.prevVelocity = { x: 0, y: 0, z: 0 };
    this.jumpApex = 0;
    this.jumpAttempts = 0;
    this.jumpSuccesses = 0;
    this.missedJumps = 0;
    this.landingVelocities = [];
    this.recoveryCount = 0;
    this.deathCount = 0;
    this.groundedTicks = 0;
    this.totalTicks = 0;
  }
}

export function idleInput(): InputSnapshot {
  return {
    moveX: 0,
    moveZ: 0,
    jumpPressed: false,
    jumpHeld: false,
    sprint: false,
    crouch: false,
    attack: false,
  };
}

export function forwardJumpSequence(ticks: number): InputSnapshot[] {
  const frames: InputSnapshot[] = [];
  for (let i = 0; i < ticks; i++) {
    frames.push({
      moveX: 0,
      moveZ: 1,
      jumpPressed: i === 30 || i === 120 || i === 200,
      jumpHeld: i >= 30 && i <= 35,
      sprint: i > 10 && i < 180,
      crouch: false,
      attack: false,
    });
  }
  return frames;
}

export function hashPositions(frames: LabFrame[]): string {
  let h = 0;
  for (const f of frames) {
    const s = `${f.tick}:${f.position.x.toFixed(4)},${f.position.y.toFixed(4)},${f.position.z.toFixed(4)}`;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
  }
  return `h${Math.abs(h).toString(16)}`;
}

export { FIXED_DT };
