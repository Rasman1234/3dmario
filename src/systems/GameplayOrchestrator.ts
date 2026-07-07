import { InputAction } from '../domain/types';
import type { EventBus } from '../infrastructure/EventBus';
import type { InputManager } from '../core/InputManager';
import type { GameplayPipeline } from '../gameplay/GameplayPipeline';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { PlayerCharacter } from '../characters/PlayerCharacter';
import type { SpringArmCamera } from '../camera/SpringArmCamera';
import { MovementState } from '../gameplay/MovementState';

const PLAYER_ID = 'player';

/** Syncs input → movement → physics step → rendering each fixed tick. */

export class GameplayOrchestrator {
  constructor(private readonly events: EventBus) {}

  update(
    dt: number,
    input: InputManager,
    pipeline: GameplayPipeline,
    physics: PhysicsWorld | null,
    player: PlayerCharacter | null,
    camera: SpringArmCamera | null,
  ): void {
    if (input.isActionJustPressed(InputAction.CameraLeft)) camera?.rotateYaw(-0.1);
    if (input.isActionJustPressed(InputAction.CameraRight)) camera?.rotateYaw(0.1);

    const movement = pipeline.movement;
    const wasGrounded = movement.onGround;

    if (physics?.isReady) {
      movement.physicsDriven = true;
    }

    pipeline.processInput(dt, input);

    if (physics?.isReady) {
      const vel = movement.velocity;
      const result = physics.moveCharacter(PLAYER_ID, {
        x: vel.x * dt,
        y: vel.y * dt,
        z: vel.z * dt,
      });
      physics.step(dt);

      const pos = physics.getPosition(PLAYER_ID);
      movement.syncPositionFromPhysics(pos);
      movement.setGrounded(result.grounded);
      movement.setWall(result.wallHit, result.wallNormal);
      movement.applyGroundingTransition(wasGrounded, result.grounded);
    }

    const snap = movement.snapshot();
    player?.setPosition(snap.position);
    player?.setRotation(snap.facingAngle);
    player?.setState(snap.state);
    player?.update(dt);
    camera?.setTarget(snap.position);
    camera?.update(dt, Math.hypot(snap.velocity.x, snap.velocity.z));

    if (snap.state === MovementState.Land) {
      this.events.emit('camera:shake', { intensity: 0.15, duration: 0.1 });
    }
  }

  initPhysics(physics: PhysicsWorld, pipeline: GameplayPipeline, spawn: { x: number; y: number; z: number }): void {
    physics.createKinematicCharacter(PLAYER_ID, spawn, 0.4, 1.6);
    pipeline.movement.reset(spawn);
    pipeline.movement.physicsDriven = true;
    physics.setPosition(PLAYER_ID, spawn);
  }
}
