import * as THREE from 'three';
import type { CollectibleInstance } from './CollectibleManager';
import { CollectibleType } from './CollectibleType';

const COLORS: Record<CollectibleType, number> = {
  [CollectibleType.Coin]: 0xffd700,
  [CollectibleType.GoldenCoin]: 0xffaa00,
  [CollectibleType.Star]: 0xffff00,
  [CollectibleType.Gem]: 0x00ffaa,
  [CollectibleType.Crystal]: 0xaa00ff,
  [CollectibleType.Key]: 0xff8800,
  [CollectibleType.Artifact]: 0xff00ff,
};

export class CollectibleRenderer {
  readonly group = new THREE.Group();
  private readonly meshes = new Map<string, THREE.Mesh>();
  private spinPhase = 0;

  sync(items: CollectibleInstance[]): void {
    for (const item of items) {
      if (item.collected) {
        const mesh = this.meshes.get(item.id);
        if (mesh) {
          this.group.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
          this.meshes.delete(item.id);
        }
        continue;
      }
      let mesh = this.meshes.get(item.id);
      if (!mesh) {
        const geo = item.type === CollectibleType.Star
          ? new THREE.OctahedronGeometry(0.4)
          : new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16);
        const mat = new THREE.MeshStandardMaterial({
          color: COLORS[item.type],
          emissive: COLORS[item.type],
          emissiveIntensity: 0.3,
          metalness: 0.8,
          roughness: 0.2,
        });
        mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        this.meshes.set(item.id, mesh);
        this.group.add(mesh);
      }
      mesh.position.set(item.position.x, item.position.y + 0.5 + Math.sin(this.spinPhase + parseFloat(item.id) * 0.5) * 0.15, item.position.z);
      mesh.rotation.y = this.spinPhase;
    }
  }

  update(dt: number): void {
    this.spinPhase += dt * 3;
  }

  dispose(): void {
    for (const mesh of this.meshes.values()) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    this.meshes.clear();
    this.group.clear();
  }
}
