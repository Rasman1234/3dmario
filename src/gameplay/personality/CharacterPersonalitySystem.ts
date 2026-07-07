import type { FeelMovementBridge } from '../MovementConfig';
import { MovementState } from '../MovementState';
import type { CharacterFeelSystem } from '../feel/CharacterFeelSystem';
import type { EventBus } from '../../infrastructure/EventBus';
import type { InputManager } from '../../core/InputManager';
import type { PersonalityProfile, PersonalityVisualState } from './types';
import { getActivePersonality, getPersonalities } from './types';
import { AnimationFeel } from './AnimationFeel';
import { SquashStretch, createSquashState } from './SquashStretch';
import { SecondaryMotion } from './SecondaryMotion';
import { InputFeel, type InputVisual } from './InputFeel';
import { LandingFeel } from './LandingFeel';
import { ExpressionSystem } from './ExpressionSystem';
import { CharacterMood } from './CharacterMood';
import { FeelTimeline } from './FeelTimeline';
import { PersonalityRegression, type PersonalityRegressionResult } from './PersonalityRegression';

export interface PersonalitySnapshot {
  profile: PersonalityProfile;
  visual: PersonalityVisualState;
  inputVisual: InputVisual;
  mood: string;
  expressions: ReturnType<ExpressionSystem['getRecent']>;
  timelineAscii: string;
  regression?: PersonalityRegressionResult;
}

/** Character Personality System v1 — expression over mechanics. */

export class CharacterPersonalitySystem {
  readonly timeline = new FeelTimeline();
  readonly regression = new PersonalityRegression();
  readonly inputFeel = new InputFeel();
  readonly landingFeel: LandingFeel;

  private profile: PersonalityProfile;
  private readonly animation: AnimationFeel;
  private readonly squashStretch: SquashStretch;
  private readonly secondary: SecondaryMotion;
  private readonly expressions: ExpressionSystem;
  private readonly mood: CharacterMood;
  private readonly squashState = createSquashState();
  private simTick = 0;
  private wasAirborne = false;
  private lastLandTick = -999;
  private damagedFlag = false;
  private celebrateFlag = false;
  private lastRegression?: PersonalityRegressionResult;
  private lastVisual: PersonalityVisualState | null = null;
  private lastInputVisual: InputVisual | null = null;

  constructor(
    private readonly movement: FeelMovementBridge,
    private readonly feel: CharacterFeelSystem,
    events: EventBus,
  ) {
    this.profile = getActivePersonality();
    this.animation = new AnimationFeel(this.profile);
    this.squashStretch = new SquashStretch(this.profile);
    this.secondary = new SecondaryMotion(this.profile);
    this.expressions = new ExpressionSystem(this.profile);
    this.mood = new CharacterMood(this.profile);
    this.landingFeel = new LandingFeel(events);
  }

  applyPersonality(id: string): boolean {
    const p = getPersonalities().find((x) => x.id === id);
    if (!p) return false;
    this.profile = p;
    this.animation.setProfile(p);
    this.squashStretch.setProfile(p);
    this.secondary.setProfile(p);
    this.expressions.setProfile(p);
    this.mood.setProfile(p);
    return true;
  }

  update(dt: number, input: InputManager): PersonalityVisualState {
    this.simTick++;
    this.timeline.advanceTick();
    this.expressions.advanceTick();
    this.timeline.mark('input', 'intent');

    const m = this.movement;
    const speed = Math.hypot(m.velocity.x, m.velocity.z);
    const inputVisual = this.inputFeel.record(input, m.inputBuffer.jumpBuffered);
    this.timeline.mark('physics', m.state);

    const { phase, t, poseKind } = this.animation.update(
      dt,
      m.state,
      m.velocity.y,
      m.onGround,
      m.facingAngle,
      speed,
    );
    this.timeline.mark('animation', phase);

    const pose = this.animation.getPoseLibrary().sample(phase, poseKind, t);

    if (m.state === MovementState.Jump && !this.wasAirborne) {
      this.squashStretch.onTakeoff(this.squashState);
    }
    if (!m.onGround && m.velocity.y > 0) {
      this.squashStretch.onAscent(this.squashState, m.velocity.y);
    }
    if (m.state === MovementState.Land && this.wasAirborne) {
      const landingVel = Math.abs(m.velocity.y);
      this.squashStretch.onImpact(this.squashState, landingVel);
      const jumpRecord = this.feel.telemetry.getLatest();
      this.landingFeel.fromJump(m.position, landingVel, jumpRecord);
      this.timeline.mark('camera', 'shake');
      this.timeline.mark('audio', 'land');
      this.timeline.mark('fx', 'dust');
      this.timeline.mark('telemetry', jumpRecord?.id ?? 'land');
      if (jumpRecord) {
        this.expressions.onLanding(jumpRecord.rating, landingVel);
        this.expressions.onLongJump(jumpRecord.apexHeight);
        this.expressions.onChainJump();
      }
      this.lastLandTick = this.simTick;
    }
    if (m.state === MovementState.WallJump) {
      this.expressions.onWallJump();
    }
    this.expressions.onFastTurn(this.animation.getTurnVelocity());
    this.squashStretch.tick(this.squashState, dt);

    const moodState = this.mood.update(dt, {
      grounded: m.onGround,
      speed,
      damaged: this.damagedFlag,
      celebrated: this.celebrateFlag,
      failed: m.position.y < -5,
      curious: this.simTick - this.lastLandTick > 600 && m.onGround && speed < 0.5,
    });
    this.damagedFlag = false;
    this.celebrateFlag = false;

    const secondary = this.secondary.solve(this.simTick, pose, speed, t);
    const latestExpression = this.expressions.getRecent().at(-1);

    this.wasAirborne = !m.onGround;

    this.lastVisual = {
      phase,
      phaseT: t,
      pose,
      squashX: this.squashState.squashX,
      squashY: this.squashState.squashY,
      stretch: this.squashState.stretch,
      secondary,
      mood: moodState,
      expression: latestExpression?.type,
      expressionT: latestExpression ? this.simTick - latestExpression.tick : 0,
    };
    this.lastInputVisual = inputVisual;
    return this.lastVisual;
  }

  onDamaged(): void {
    this.damagedFlag = true;
    this.animation.forcePhase('damage');
  }

  onVictory(): void {
    this.celebrateFlag = true;
    this.animation.forcePhase('victory');
  }

  runRegression(): PersonalityRegressionResult {
    const result = this.regression.evaluate({
      animationTiming: this.animation.getTiming(),
      avgJumpRating: this.feel.telemetry.getAverageRating(),
      expressionAvg: this.expressions.getAverageIntensity(),
      playerRating: this.feel.feedback.getSatisfactionScore() || 4,
    });
    this.lastRegression = result;
    return result;
  }

  snapshot(): PersonalitySnapshot {
    const visual = this.lastVisual ?? this.emptyVisual();
    const inputVisual = this.lastInputVisual ?? { recent: [], jumpBuffered: false, forgivenessActive: false, predictedJump: false };
    return {
      profile: this.profile,
      visual,
      inputVisual,
      mood: visual.mood,
      expressions: this.expressions.getRecent(),
      timelineAscii: this.timeline.renderAscii(),
      regression: this.lastRegression,
    };
  }

  private emptyVisual(): PersonalityVisualState {
    return {
      phase: 'idle',
      phaseT: 0,
      pose: { bodyY: 0, torsoLean: 0, armL: 0, armR: 0, legL: 0, legR: 0 },
      squashX: 1,
      squashY: 1,
      stretch: 1,
      secondary: {
        hat: { x: 0, y: 0, z: 0 },
        armL: { x: 0, z: 0 },
        armR: { x: 0, z: 0 },
        legL: { x: 0 },
        legR: { x: 0 },
        torso: { x: 0 },
        backpack: { y: 0, z: 0 },
      },
      mood: 'idle',
      expressionT: 0,
    };
  }

  listPersonalities(): PersonalityProfile[] {
    return getPersonalities();
  }
}
