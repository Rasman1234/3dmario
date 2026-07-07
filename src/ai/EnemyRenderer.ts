import * as THREE from 'three';
import type { EnemyState } from '../ai/EnemyAI';
import { EnemyType } from '../ai/BehaviorState';

const COLORS: Record<string, number> = {
  walker: 0x8b4513,
  runner: 0xff4500,
  flyer: 0x4169e1,
  jumper: 0x32cd32,
  shooter: 0x9932cc,
  heavy: 0x2f4f4f,
  tank: 0x1a1a2e,
  mini_boss: 0xffd700,
};

/** Enemy visual representation synced with AI state. */

export class EnemyRenderer {
  readonly group = new THREE.Group();
  private readonly meshes = new Map<string, THREE.Mesh>();

  sync(enemies: EnemyState[]): void {
    const aliveIds = new Set(enemies.filter((e) => e.alive).map((e) => e.id));

    for (const [id, mesh] of this.meshes) {
      if (!aliveIds.has(id)) {
        this.group.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        this.meshes.delete(id);
      }
    }

    for (const e of enemies) {
      if (!e.alive) continue;
      let mesh = this.meshes.get(e.id);
      if (!mesh) {
        const size = e.type === EnemyType.Tank || e.type === EnemyType.MiniBoss ? 1.2 : 0.6;
        const geo = e.type === EnemyType.Flyer
          ? new THREE.SphereGeometry(size * 0.5, 8, 8)
          : new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshStandardMaterial({
          color: COLORS[e.type] ?? 0x888888,
          roughness: 0.7,
        });
        mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        this.meshes.set(e.id, mesh);
        this.group.add(mesh);
      }
      mesh.position.set(e.position.x, e.position.y + 0.5, e.position.z);
      mesh.rotation.y = e.facingAngle;
    }
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
