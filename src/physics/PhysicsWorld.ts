import RAPIER from '@dimforge/rapier3d-compat';
import type { Vec3 } from '../domain/types';

export interface RaycastHit {
  point: Vec3;
  normal: Vec3;
  distance: number;
  entityId?: string;
}

export interface CharacterMoveResult {
  grounded: boolean;
  wallHit: boolean;
  wallNormal: Vec3;
}

const WALL_PROBE_DIST = 0.55;

/** Rapier3d physics world — persistent character controller, fixed-step integration. */

export class PhysicsWorld {
  private world!: RAPIER.World;
  private initialized = false;
  private readonly bodyMap = new Map<string, RAPIER.RigidBody>();
  private readonly colliderMap = new Map<string, RAPIER.Collider>();
  private readonly controllerMap = new Map<string, RAPIER.KinematicCharacterController>();
  private readonly characterIds = new Set<string>();

  static async create(gravity: Vec3): Promise<PhysicsWorld> {
    await RAPIER.init();
    const pw = new PhysicsWorld();
    pw.world = new RAPIER.World(gravity);
    pw.initialized = true;
    return pw;
  }

  get isReady(): boolean {
    return this.initialized;
  }

  get characterControllerCount(): number {
    return this.controllerMap.size;
  }

  step(dt: number): void {
    if (!this.initialized) return;
    this.world.timestep = dt;
    this.world.step();
  }

  createStaticBox(id: string, pos: Vec3, halfExtents: Vec3): void {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z),
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z),
      body,
    );
    this.bodyMap.set(id, body);
    this.colliderMap.set(id, collider);
  }

  createGround(id: string, y = 0): void {
    this.createStaticBox(id, { x: 0, y, z: 0 }, { x: 50, y: 0.5, z: 50 });
  }

  createDynamicBall(id: string, pos: Vec3, radius: number): void {
    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(pos.x, pos.y, pos.z)
        .setLinearDamping(0.5),
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.ball(radius).setRestitution(0.3),
      body,
    );
    this.bodyMap.set(id, body);
    this.colliderMap.set(id, collider);
  }

  createKinematicCharacter(id: string, pos: Vec3, radius: number, height: number): void {
    if (this.characterIds.has(id)) {
      this.setPosition(id, pos);
      return;
    }

    const body = this.world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(pos.x, pos.y, pos.z),
    );
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.capsule(height * 0.5, radius).setFriction(0),
      body,
    );

    const controller = this.world.createCharacterController(0.01);
    controller.enableSnapToGround(0.5);
    controller.setMaxSlopeClimbAngle((45 * Math.PI) / 180);
    controller.enableAutostep(0.35, 0.15, true);

    this.bodyMap.set(id, body);
    this.colliderMap.set(id, collider);
    this.controllerMap.set(id, controller);
    this.characterIds.add(id);
  }

  moveCharacter(id: string, desiredTranslation: Vec3): CharacterMoveResult {
    const body = this.bodyMap.get(id);
    const collider = this.colliderMap.get(id);
    const controller = this.controllerMap.get(id);
    if (!body || !collider || !controller) {
      return { grounded: false, wallHit: false, wallNormal: { x: 0, y: 0, z: 0 } };
    }

    controller.computeColliderMovement(
      collider,
      { x: desiredTranslation.x, y: desiredTranslation.y, z: desiredTranslation.z },
    );
    const corrected = controller.computedMovement();
    const grounded = controller.computedGrounded();

    const pos = body.translation();
    body.setNextKinematicTranslation({
      x: pos.x + corrected.x,
      y: pos.y + corrected.y,
      z: pos.z + corrected.z,
    });

    const wall = this.probeWall(pos, desiredTranslation);

    return {
      grounded,
      wallHit: wall.hit,
      wallNormal: wall.normal,
    };
  }

  private probeWall(
    pos: { x: number; y: number; z: number },
    desired: Vec3,
  ): { hit: boolean; normal: Vec3 } {
    const horizLen = Math.hypot(desired.x, desired.z);
    if (horizLen < 0.001) {
      return { hit: false, normal: { x: 0, y: 0, z: 0 } };
    }

    const dir = {
      x: desired.x / horizLen,
      y: 0,
      z: desired.z / horizLen,
    };

    const origin = { x: pos.x, y: pos.y + 0.5, z: pos.z };
    const hit = this.raycast(origin, dir, WALL_PROBE_DIST);
    if (hit && hit.distance < WALL_PROBE_DIST * 0.9) {
      return { hit: true, normal: hit.normal };
    }

    return { hit: false, normal: { x: 0, y: 0, z: 0 } };
  }

  getPosition(id: string): Vec3 {
    const body = this.bodyMap.get(id);
    if (!body) return { x: 0, y: 0, z: 0 };
    const t = body.translation();
    return { x: t.x, y: t.y, z: t.z };
  }

  setPosition(id: string, pos: Vec3): void {
    const body = this.bodyMap.get(id);
    body?.setTranslation({ x: pos.x, y: pos.y, z: pos.z }, true);
  }

  raycast(origin: Vec3, direction: Vec3, maxDist: number): RaycastHit | null {
    const len = Math.hypot(direction.x, direction.y, direction.z);
    if (len < 1e-6) return null;

    const norm = { x: direction.x / len, y: direction.y / len, z: direction.z / len };
    const ray = new RAPIER.Ray(origin, norm);
    const hit = this.world.castRayAndGetNormal(ray, maxDist, true);
    if (!hit) return null;

    const point = ray.pointAt(hit.timeOfImpact);
    return {
      point: { x: point.x, y: point.y, z: point.z },
      normal: { x: hit.normal.x, y: hit.normal.y, z: hit.normal.z },
      distance: hit.timeOfImpact,
    };
  }

  remove(id: string): void {
    const body = this.bodyMap.get(id);
    if (body) {
      this.world.removeRigidBody(body);
      this.bodyMap.delete(id);
      this.colliderMap.delete(id);
      this.controllerMap.delete(id);
      this.characterIds.delete(id);
    }
  }

  dispose(): void {
    this.controllerMap.clear();
    this.characterIds.clear();
    this.bodyMap.clear();
    this.colliderMap.clear();
    if (this.initialized) {
      this.world.free();
      this.initialized = false;
    }
  }
}
