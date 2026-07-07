import type { PhysicsWorld } from '../../physics/PhysicsWorld';
import type { LabSceneId } from '../types';

export interface LabSceneDefinition {
  id: LabSceneId;
  name: string;
  spawn: { x: number; y: number; z: number };
  setup(physics: PhysicsWorld): void;
  defaultInputTicks: number;
}

export function buildPhysicsIsolationScene(): LabSceneDefinition {
  return {
    id: 'physics_isolation',
    name: 'Physics Isolation',
    spawn: { x: 0, y: 2, z: 0 },
    defaultInputTicks: 180,
    setup(physics) {
      physics.createGround('ground', 0);
      physics.createStaticBox('step1', { x: 4, y: 0.5, z: 0 }, { x: 2, y: 0.5, z: 2 });
      physics.createStaticBox('step2', { x: 8, y: 1, z: 0 }, { x: 2, y: 0.5, z: 2 });
    },
  };
}

export function buildJumpLaboratoryScene(): LabSceneDefinition {
  return {
    id: 'jump_laboratory',
    name: 'Jump Laboratory',
    spawn: { x: 0, y: 2, z: 0 },
    defaultInputTicks: 240,
    setup(physics) {
      physics.createGround('ground_start', 0);
      physics.createStaticBox('platform_low', { x: 5, y: 0.5, z: 0 }, { x: 1.5, y: 0.5, z: 1.5 });
      physics.createStaticBox('platform_mid', { x: 9, y: 1.5, z: 0 }, { x: 1.5, y: 0.5, z: 1.5 });
      physics.createStaticBox('platform_high', { x: 13, y: 2.5, z: 0 }, { x: 1.5, y: 0.5, z: 1.5 });
    },
  };
}

export function buildGapLaboratoryScene(): LabSceneDefinition {
  return {
    id: 'gap_laboratory',
    name: 'Gap Laboratory',
    spawn: { x: 0, y: 2, z: 0 },
    defaultInputTicks: 300,
    setup(physics) {
      physics.createStaticBox('platform_a', { x: 0, y: 0, z: 0 }, { x: 3, y: 0.5, z: 3 });
      physics.createStaticBox('platform_b', { x: 7, y: 0, z: 0 }, { x: 3, y: 0.5, z: 3 });
      physics.createStaticBox('platform_c', { x: 14, y: 0.5, z: 0 }, { x: 3, y: 0.5, z: 3 });
    },
  };
}

export function buildPlatformLaboratoryScene(): LabSceneDefinition {
  return {
    id: 'platform_laboratory',
    name: 'Platform Laboratory',
    spawn: { x: 0, y: 2, z: 0 },
    defaultInputTicks: 240,
    setup(physics) {
      physics.createGround('ground', 0);
      physics.createStaticBox('moving_stub', { x: 6, y: 1, z: 0 }, { x: 2, y: 0.25, z: 2 });
      physics.createStaticBox('landing', { x: 12, y: 1, z: 0 }, { x: 2, y: 0.5, z: 2 });
    },
  };
}

export function getLabScene(id: LabSceneId): LabSceneDefinition {
  switch (id) {
    case 'physics_isolation':
      return buildPhysicsIsolationScene();
    case 'jump_laboratory':
      return buildJumpLaboratoryScene();
    case 'gap_laboratory':
      return buildGapLaboratoryScene();
    case 'platform_laboratory':
      return buildPlatformLaboratoryScene();
    default:
      return buildPhysicsIsolationScene();
  }
}

export const LAB_SCENE_IDS: LabSceneId[] = [
  'physics_isolation',
  'jump_laboratory',
  'gap_laboratory',
  'platform_laboratory',
];
