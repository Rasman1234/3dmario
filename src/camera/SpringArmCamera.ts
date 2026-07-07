import * as THREE from 'three';
import { clamp, smoothDamp } from '../utils/Math';
import type { Vec3 } from '../domain/types';

/** AAA spring-arm camera with collision, smoothing, zoom, and shake. */

export class SpringArmCamera {
  readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private target = new THREE.Vector3();
  private currentDistance: number;
  private targetDistance: number;
  private yaw = 0;
  private pitch = 0.3;
  private shoulderOffset = 0.8;
  private shakeIntensity = 0;
  private shakeDuration = 0;
  private shakeTimer = 0;
  private distanceVel = { value: 0 };
  private targetAssigned = false;
  private readonly raycaster = new THREE.Raycaster();

  constructor(scene: THREE.Scene, aspect: number, distance = 12) {
    this.scene = scene;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 500);
    this.currentDistance = distance;
    this.targetDistance = distance;
  }

  setTarget(pos: Vec3): void {
    this.target.set(pos.x, pos.y + 1.5, pos.z);
    this.targetAssigned = true;
  }

  get hasTarget(): boolean {
    return this.targetAssigned;
  }

  setDistance(d: number): void {
    this.targetDistance = d;
  }

  rotateYaw(delta: number): void {
    this.yaw += delta;
  }

  rotatePitch(delta: number): void {
    this.pitch = clamp(this.pitch + delta, -0.3, 1.2);
  }

  shake(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  update(dt: number, playerSpeed = 0): void {
    const speedZoom = clamp(playerSpeed / 20, 0, 1) * 2;
    const desiredDist = this.targetDistance + speedZoom;
    this.currentDistance = smoothDamp(this.currentDistance, desiredDist, this.distanceVel, 0.3, dt);

    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch) * this.currentDistance + Math.cos(this.yaw) * this.shoulderOffset,
      Math.sin(this.pitch) * this.currentDistance + 2,
      Math.cos(this.yaw) * Math.cos(this.pitch) * this.currentDistance - Math.sin(this.yaw) * this.shoulderOffset,
    );

    const idealPos = this.target.clone().add(offset);
    const corrected = this.resolveCollision(idealPos);

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = this.shakeTimer / this.shakeDuration;
      corrected.x += (Math.random() - 0.5) * this.shakeIntensity * t;
      corrected.y += (Math.random() - 0.5) * this.shakeIntensity * t * 0.5;
      corrected.z += (Math.random() - 0.5) * this.shakeIntensity * t;
    }

    this.camera.position.lerp(corrected, clamp(dt * 12, 0, 1));
    this.camera.lookAt(this.target);
  }

  private resolveCollision(idealPos: THREE.Vector3): THREE.Vector3 {
    const dir = idealPos.clone().sub(this.target);
    const dist = dir.length();
    if (dist < 0.01) return idealPos;
    dir.normalize();
    this.raycaster.set(this.target, dir);
    this.raycaster.far = dist;
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    if (hits.length > 0 && hits[0]!.distance < dist) {
      return this.target.clone().add(dir.multiplyScalar(hits[0]!.distance - 0.5));
    }
    return idealPos;
  }

  resize(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
