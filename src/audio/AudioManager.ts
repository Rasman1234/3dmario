import type { GameSettings } from '../domain/types';
import { SoundId } from './SoundId';

/** Web Audio API manager — procedural SFX, music crossfade, volume control. */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private sfxGain!: GainNode;
  private musicGain!: GainNode;
  private musicOsc: OscillatorNode | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    this.initialized = true;
  }

  applySettings(settings: GameSettings): void {
    if (!this.ctx) return;
    this.sfxGain.gain.value = settings.muted ? 0 : settings.sfxVolume;
    this.musicGain.gain.value = settings.muted ? 0 : settings.musicVolume;
  }

  playSfx(id: SoundId | string, volume = 1): void {
    if (!this.ctx) return;
    const freq = this.getFrequency(id);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = id.includes('music') ? 'sine' : 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playMusic(id: SoundId, fade = 0.5): void {
    if (!this.ctx) return;
    this.stopMusic(fade);
    this.musicOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    this.musicOsc.type = 'sine';
    this.musicOsc.frequency.value = this.getFrequency(id);
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + fade);
    this.musicOsc.connect(gain);
    gain.connect(this.musicGain);
    this.musicOsc.start();
  }

  stopMusic(fade = 0.3): void {
    if (!this.musicOsc || !this.ctx) return;
    this.musicOsc.stop(this.ctx.currentTime + fade);
    this.musicOsc = null;
  }

  private getFrequency(id: SoundId | string): number {
    const map: Record<string, number> = {
      [SoundId.Jump]: 440,
      [SoundId.Land]: 220,
      [SoundId.Coin]: 880,
      [SoundId.Star]: 1320,
      [SoundId.PowerUp]: 660,
      [SoundId.EnemyHit]: 150,
      [SoundId.EnemyDefeat]: 100,
      [SoundId.PlayerHurt]: 80,
      [SoundId.Explosion]: 60,
      [SoundId.BossRoar]: 50,
      [SoundId.MusicMenu]: 261,
      [SoundId.MusicLevel]: 329,
      [SoundId.MusicBoss]: 196,
      [SoundId.Footstep]: 300,
      [SoundId.Checkpoint]: 523,
      [SoundId.Ambient]: 200,
    };
    return map[id] ?? 440;
  }

  dispose(): void {
    this.stopMusic(0);
    this.ctx?.close();
    this.initialized = false;
  }
}
