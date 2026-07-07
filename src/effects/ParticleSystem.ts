import * as THREE from 'three';
import type { Vec3 } from '../domain/types';
import type { IPoolable } from '../domain/interfaces';
import { ObjectPool } from '../infrastructure/ObjectPool';

class Particle implements IPoolable {
  mesh: THREE.Mesh | null = null;
  life = 0;
  velocity = new THREE.Vector3();

  reset(): void {
    this.life = 0;
    this.velocity.set(0, 0, 0);
    if (this.mesh) this.mesh.visible = false;
  }
}

/** GPU-friendly particle system with object pooling. */

export class ParticleSystem {
  readonly group = new THREE.Group();
  private readonly pool: ObjectPool<Particle>;
  private readonly geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);

  constructor() {
    this.pool = new ObjectPool(() => new Particle(), 32, 256);
    this.pool.prewarm(32);
  }

  emit(position: Vec3 | THREE.Vector3, color: number, count: number, speed = 3): void {
    const pos = position instanceof THREE.Vector3 ? position : new THREE.Vector3(position.x, position.y, position.z);
    for (let i = 0; i < count; i++) {
      const p = this.pool.acquire();
      if (!p.mesh) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
        p.mesh = new THREE.Mesh(this.geo, mat);
        this.group.add(p.mesh);
      }
      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHex(color);
      mat.opacity = 0.8;
      p.mesh.visible = true;
      p.mesh.position.copy(pos);
      p.life = 0.5 + Math.random() * 0.5;
      p.velocity.set(
        (Math.random() - 0.5) * speed,
        Math.random() * speed,
        (Math.random() - 0.5) * speed,
      );
    }
  }

  burst(position: Vec3 | THREE.Vector3, type: 'dust' | 'coin' | 'explosion' | 'magic'): void {
    const colors = { dust: 0xccaa88, coin: 0xffd700, explosion: 0xff4400, magic: 0xaa00ff };
    const counts = { dust: 8, coin: 12, explosion: 20, magic: 15 };
    this.emit(position, colors[type], counts[type]);
  }

  update(dt: number): void {
    this.pool.forEachActive((p) => {
      if (!p.mesh?.visible) return;
      p.life -= dt;
      p.mesh.position.addScaledVector(p.velocity, dt);
      p.velocity.y -= 9.8 * dt;
      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, p.life);
      if (p.life <= 0) {
        this.pool.release(p);
      }
    });
  }

  dispose(): void {
    this.pool.drain();
    this.group.clear();
    this.geo.dispose();
  }
}
