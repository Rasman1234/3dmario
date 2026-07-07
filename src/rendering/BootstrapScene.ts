import * as THREE from 'three';
import type { IDisposable } from '../domain/interfaces';

/** Procedural bootstrap scene for Phase 1 — replaced by level loader in Phase 13. */

export class BootstrapScene implements IDisposable {
  readonly root = new THREE.Group();
  private readonly meshes: THREE.Mesh[] = [];

  constructor() {
    this.buildEnvironment();
    this.buildLighting();
  }

  private buildEnvironment(): void {
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x4a9c2d,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.root.add(ground);
    this.meshes.push(ground);

    const platformGeo = new THREE.BoxGeometry(6, 1, 6);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.7,
      metalness: 0.1,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, 2, -8);
    platform.castShadow = true;
    platform.receiveShadow = true;
    this.root.add(platform);
    this.meshes.push(platform);
  }

  private buildLighting(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    this.root.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff5e6, 1.2);
    sun.position.set(20, 40, 15);
    sun.castShadow = true;
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 100;
    sun.shadow.mapSize.set(1024, 1024);
    this.root.add(sun);
  }

  dispose(): void {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
    }
    this.root.clear();
  }
}
