import * as THREE from 'three';
import type { LevelConfig } from './LevelManager';

/** Builds Three.js level geometry from level config. */

export class LevelScene {
  readonly root = new THREE.Group();
  private readonly meshes: THREE.Mesh[] = [];

  build(config: LevelConfig): void {
    this.clear();

    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a9c2d, roughness: 0.85 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.root.add(ground);
    this.meshes.push(ground);

    const platColors: Record<string, number> = {
      static: 0x8b5a2b,
      moving: 0x4488cc,
      spring: 0x00ff88,
      breakable: 0xcc6644,
      falling: 0xaa8866,
    };

    for (const plat of config.platforms) {
      const geo = new THREE.BoxGeometry(plat.size.x, plat.size.y, plat.size.z);
      const mat = new THREE.MeshStandardMaterial({
        color: platColors[plat.type] ?? 0x8b5a2b,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(plat.pos.x, plat.pos.y, plat.pos.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.root.add(mesh);
      this.meshes.push(mesh);
    }

    const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sun.position.set(20, 40, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.root.add(sun);
    this.root.add(new THREE.AmbientLight(0xffffff, 0.45));
  }

  private clear(): void {
    for (const m of this.meshes) {
      m.geometry.dispose();
      if (m.material instanceof THREE.Material) m.material.dispose();
    }
    this.meshes.length = 0;
    this.root.clear();
  }

  dispose(): void {
    this.clear();
  }
}
