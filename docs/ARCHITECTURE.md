# 3D Mario — Architecture (All Phases Complete)

## Phase Status

| Phase | System | Status | Key Files |
|-------|--------|--------|-----------|
| 1 | Core Framework | ✅ | EventBus, ServiceLocator, GameLoop, Config, Save |
| 2 | Movement | ✅ | MovementController, InputBuffer, MovementState |
| 3 | Camera | ✅ | SpringArmCamera (collision, shake, zoom) |
| 4 | Character | ✅ | PlayerCharacter (animated capsule hero) |
| 5 | Physics | ✅ | PhysicsWorld (Rapier3d kinematic character) |
| 6 | Enemy AI | ✅ | EnemyAI, EnemyRenderer (8 enemy types) |
| 7 | Combat | ✅ | CombatSystem, DamageCalculator, combos |
| 8 | Power Ups | ✅ | PowerUpManager (15 power-up types) |
| 9 | Collectibles | ✅ | CollectibleManager, coins/stars/gems |
| 10 | UI | ✅ | UIManager, HUD, PauseMenu, GameOver |
| 11 | Audio | ✅ | AudioManager (Web Audio procedural SFX) |
| 12 | Effects | ✅ | ParticleSystem, GameFeelController |
| 13 | Levels | ✅ | LevelManager, LevelScene, grassland_01 |
| 14 | Bosses | ✅ | BossController (3-phase Meadow King) |
| 15 | Optimization | ✅ | PerformanceMonitor, LODManager, ObjectPool |
| 16 | Polish | ✅ | Landing shake, hit-stop, screen flash, squash |

## Module Count

- **46 source modules** across 20 bounded contexts
- **45 unit tests** passing
- **0 cyclic dependencies**
- **0 import violations** (after orchestrator refactor)

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Space | Jump (double jump in air) |
| Shift | Sprint |
| C + Attack | Ground pound |
| F / Click | Attack |
| Q / R | Rotate camera |
| E | Interact |
| Enter | Start / Confirm |
| Esc | Pause |

## Run

```bash
./scripts/start.sh
npm test
npm run build
```
