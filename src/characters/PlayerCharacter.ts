import * as THREE from 'three';
import type { Vec3 } from '../domain/types';
import { MovementState } from '../gameplay/MovementState';
import type { PersonalityVisualState } from '../gameplay/personality/types';
import type { IDisposable } from '../domain/interfaces';
import { CharacterRig } from './CharacterRig';

/** Player character — living animated actor driven by personality system. */

export class PlayerCharacter implements IDisposable {
  readonly root: THREE.Group;
  private readonly rig: CharacterRig;
  private state = MovementState.Idle;
  private expressionFlash = 0;

  constructor() {
    this.rig = new CharacterRig();
    this.root = this.rig.root;
    this.root.name = 'player';
  }

  setPosition(pos: Vec3): void {
    this.root.position.set(pos.x, pos.y, pos.z);
  }

  setRotation(angle: number): void {
    this.root.rotation.y = angle;
  }

  setState(state: MovementState): void {
    this.state = state;
  }

  applyPersonalityVisual(state: PersonalityVisualState): void {
    if (state.expression) this.expressionFlash = 0.3;
    this.rig.applyVisual(state);
    this.applyMoodTint(state.mood);
  }

  update(dt: number): void {
    if (this.expressionFlash > 0) {
      this.expressionFlash -= dt;
      const mat = this.rig.body.material as THREE.MeshStandardMaterial;
      mat.emissive.setHex(0xffaa00);
      mat.emissiveIntensity = this.expressionFlash;
    } else {
      const mat = this.rig.body.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0;
    }

    const colors: Partial<Record<MovementState, number>> = {
      [MovementState.GroundPound]: 0xff6600,
      [MovementState.Dash]: 0x00ccff,
      [MovementState.WallSlide]: 0xffaa00,
    };
    if (!this.expressionFlash) {
      const mat = this.rig.body.material as THREE.MeshStandardMaterial;
      mat.color.setHex(colors[this.state] ?? 0xe52521);
    }
  }

  flash(color: number, duration = 0.1): void {
    const mat = this.rig.body.material as THREE.MeshStandardMaterial;
    const orig = mat.color.getHex();
    mat.color.setHex(color);
    setTimeout(() => mat.color.setHex(orig), duration * 1000);
  }

  private applyMoodTint(mood: string): void {
    const tints: Record<string, number> = {
      celebration: 0xffd700,
      damage: 0xff4444,
      curiosity: 0x88ccff,
      waiting: 0xaaaaaa,
      failure: 0x666666,
    };
    const mat = this.rig.body.material as THREE.MeshStandardMaterial;
    if (tints[mood] && !this.expressionFlash) {
      mat.color.lerp(new THREE.Color(tints[mood]), 0.15);
    }
  }

  dispose(): void {
    this.rig.dispose();
  }
}
