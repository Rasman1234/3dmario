import type { MoodState, PersonalityProfile } from './types';

/** Character mood — reacts to idle, success, damage, celebration, failure, curiosity. */

export class CharacterMood {
  private mood: MoodState = 'idle';
  private moodT = 0;
  private idleTimer = 0;

  constructor(private profile: PersonalityProfile) {}

  setProfile(profile: PersonalityProfile): void {
    this.profile = profile;
  }

  update(dt: number, params: {
    grounded: boolean;
    speed: number;
    damaged: boolean;
    celebrated: boolean;
    failed: boolean;
    curious: boolean;
  }): MoodState {
    this.moodT += dt;

    if (params.damaged) {
      this.mood = 'damage';
      this.moodT = 0;
      this.idleTimer = 0;
      return this.mood;
    }
    if (params.celebrated) {
      this.mood = 'celebration';
      this.moodT = 0;
      this.idleTimer = 0;
      return this.mood;
    }
    if (params.failed) {
      this.mood = 'failure';
      this.moodT = 0;
      return this.mood;
    }
    if (params.curious) {
      this.mood = 'curiosity';
      this.moodT = 0;
      return this.mood;
    }

    if (params.grounded && params.speed < 0.5) {
      this.idleTimer += dt;
      if (this.idleTimer > 3) this.mood = 'waiting';
      else this.mood = 'idle';
    } else if (params.speed > 1) {
      this.idleTimer = 0;
      if (this.mood !== 'celebration') this.mood = 'success';
    }

    if (this.moodT > 2 / this.profile.moodVolatility && this.mood !== 'waiting') {
      this.mood = 'idle';
    }

    return this.mood;
  }

  getMood(): MoodState {
    return this.mood;
  }
}
