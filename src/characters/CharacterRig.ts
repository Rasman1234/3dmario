import * as THREE from 'three';
import type { PersonalityVisualState } from '../gameplay/personality/types';

/** Character rig — body parts for pose-driven animation. */

export class CharacterRig {
  readonly root = new THREE.Group();
  readonly torso = new THREE.Group();
  readonly head: THREE.Mesh;
  readonly body: THREE.Mesh;
  readonly hat: THREE.Mesh;
  readonly armL: THREE.Mesh;
  readonly armR: THREE.Mesh;
  readonly legL: THREE.Mesh;
  readonly legR: THREE.Mesh;
  readonly backpack: THREE.Mesh;

  constructor() {
    const bodyGeo = new THREE.CapsuleGeometry(0.4, 0.8, 8, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe52521, roughness: 0.6, metalness: 0.1 });
    this.body = new THREE.Mesh(bodyGeo, bodyMat);
    this.body.castShadow = true;
    this.body.position.y = 0.9;

    const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.8 });
    this.head = new THREE.Mesh(headGeo, headMat);
    this.head.castShadow = true;
    this.head.position.y = 1.65;

    const hatGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.15, 16);
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xe52521 });
    this.hat = new THREE.Mesh(hatGeo, hatMat);
    this.hat.position.y = 1.95;
    this.hat.castShadow = true;

    const limbGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
    const limbMat = new THREE.MeshStandardMaterial({ color: 0xe52521 });
    this.armL = new THREE.Mesh(limbGeo, limbMat);
    this.armR = new THREE.Mesh(limbGeo, limbMat);
    this.legL = new THREE.Mesh(limbGeo, limbMat);
    this.legR = new THREE.Mesh(limbGeo, limbMat);
    this.armL.position.set(-0.45, 1.2, 0);
    this.armR.position.set(0.45, 1.2, 0);
    this.legL.position.set(-0.15, 0.35, 0);
    this.legR.position.set(0.15, 0.35, 0);

    const bpGeo = new THREE.BoxGeometry(0.25, 0.3, 0.15);
    this.backpack = new THREE.Mesh(bpGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    this.backpack.position.set(0, 1.1, -0.35);

    this.torso.add(this.body);
    this.root.add(this.torso, this.head, this.hat, this.armL, this.armR, this.legL, this.legR, this.backpack);
  }

  applyVisual(state: PersonalityVisualState): void {
    this.body.scale.set(state.squashX, state.squashY * state.stretch, state.squashX);
    this.body.position.y = 0.9 + state.pose.bodyY;
    this.torso.rotation.x = state.pose.torsoLean + state.secondary.torso.x;

    this.hat.position.set(0 + state.secondary.hat.x, 1.95 + state.secondary.hat.y, state.secondary.hat.z);
    this.armL.rotation.x = state.pose.armL + state.secondary.armL.x;
    this.armL.rotation.z = state.secondary.armL.z;
    this.armR.rotation.x = state.pose.armR + state.secondary.armR.x;
    this.armR.rotation.z = state.secondary.armR.z;
    this.legL.rotation.x = state.pose.legL + state.secondary.legL.x;
    this.legR.rotation.x = state.pose.legR + state.secondary.legR.x;
    this.backpack.position.y = 1.1 + state.secondary.backpack.y;
    this.backpack.position.z = -0.35 + state.secondary.backpack.z;
  }

  dispose(): void {
    const meshes = [this.body, this.head, this.hat, this.armL, this.armR, this.legL, this.legR, this.backpack];
    for (const m of meshes) {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    }
    this.root.clear();
  }
}
