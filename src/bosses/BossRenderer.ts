import * as THREE from 'three';
import type { BossController } from './BossController';

export class BossRenderer {
  readonly group = new THREE.Group();
  private mesh: THREE.Mesh | null = null;
  private pulsePhase = 0;

  sync(boss: BossController): void {
    if (boss.isDefeated) {
      if (this.mesh) this.mesh.visible = false;
      return;
    }

    if (!this.mesh) {
      const geo = new THREE.DodecahedronGeometry(2, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        emissive: 0x440000,
        emissiveIntensity: 0.5,
        roughness: 0.4,
        metalness: 0.6,
      });
      this.mesh = new THREE.Mesh(geo, mat);
      this.mesh.castShadow = true;
      this.group.add(this.mesh);
    }

    const pos = boss.position;
    this.mesh.visible = true;
    this.mesh.position.set(pos.x, pos.y + 2 + Math.sin(this.pulsePhase) * 0.3, pos.z);
    this.mesh.rotation.y += 0.01;
    const scale = 1 + (boss.currentPhase - 1) * 0.2;
    this.mesh.scale.setScalar(scale);
  }

  update(dt: number): void {
    this.pulsePhase += dt * 2;
  }

  dispose(): void {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
    this.group.clear();
  }
}
