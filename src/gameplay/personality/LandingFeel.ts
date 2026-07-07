import type { EventBus } from '../../infrastructure/EventBus';
import type { Vec3 } from '../../domain/types';
import goldenData from '../../data/personality-golden.json';
import type { JumpRecord } from '../feel/JumpTelemetry';

export interface LandingFeelPayload {
  position: Vec3;
  landingVelocity: number;
  jumpRecord?: JumpRecord;
  cameraShake: number;
  dustCount: number;
  soundId: string;
  hapticPattern: 'light' | 'medium' | 'heavy';
}

/** Landing feel coordinator — animation, camera, sound, dust, feedback, telemetry. */

export class LandingFeel {
  private readonly golden = goldenData.landingFeel;

  constructor(private readonly events: EventBus) {}

  trigger(payload: LandingFeelPayload): void {
    this.events.emit('camera:shake', {
      intensity: payload.cameraShake,
      duration: 0.1,
    });
    this.events.emit('audio:play_sfx', { id: payload.soundId });
    this.events.emit('feel:dust', {
      position: payload.position,
      count: payload.dustCount,
    });
    this.events.emit('feel:haptic', { pattern: payload.hapticPattern });
    this.events.emit('feel:landing', {
      velocity: payload.landingVelocity,
      rating: payload.jumpRecord?.rating,
      telemetryId: payload.jumpRecord?.id,
    });
  }

  fromJump(position: Vec3, landingVelocity: number, jumpRecord?: JumpRecord): void {
    const impact = Math.abs(landingVelocity);
    this.trigger({
      position,
      landingVelocity,
      jumpRecord,
      cameraShake: this.golden.cameraShake * (impact > 5 ? 1.3 : 1),
      dustCount: impact > 6 ? this.golden.dustCount + 4 : this.golden.dustCount,
      soundId: this.golden.soundId,
      hapticPattern: impact > 8 ? 'heavy' : impact > 4 ? 'medium' : 'light',
    });
  }
}
