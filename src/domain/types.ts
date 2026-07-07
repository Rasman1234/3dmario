/** Shared domain types — zero rendering or physics dependencies. */

// ─── Identifiers ─────────────────────────────────────────────────────────────

export type EntityId = string;
export type WorldId = string;
export type LevelId = string;
export type QuestId = string;

// ─── Game Flow ───────────────────────────────────────────────────────────────

export enum GameStateId {
  Boot = 'boot',
  Loading = 'loading',
  MainMenu = 'main_menu',
  WorldSelect = 'world_select',
  LevelLoading = 'level_loading',
  Playing = 'playing',
  Paused = 'paused',
  Cutscene = 'cutscene',
  BossIntro = 'boss_intro',
  BossFight = 'boss_fight',
  LevelComplete = 'level_complete',
  GameOver = 'game_over',
  Victory = 'victory',
}

// ─── Math Primitives ─────────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quat {
  x: number;
  y: number;
  z: number;
  w: number;
}

// ─── Character Stats ─────────────────────────────────────────────────────────

export interface CharacterStats {
  health: number;
  maxHealth: number;
  lives: number;
  energy: number;
  maxEnergy: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  jumpHeight: number;
  attackDamage: number;
  defense: number;
  luck: number;
  experience: number;
  level: number;
}

export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  health: 3,
  maxHealth: 3,
  lives: 3,
  energy: 100,
  maxEnergy: 100,
  stamina: 100,
  maxStamina: 100,
  speed: 8,
  jumpHeight: 4.5,
  attackDamage: 1,
  defense: 0,
  luck: 0,
  experience: 0,
  level: 1,
};

// ─── Worlds & Levels ───────────────────────────────────────────────────────────

export type WorldTheme =
  | 'grassland'
  | 'snow'
  | 'desert'
  | 'beach'
  | 'forest'
  | 'jungle'
  | 'lava'
  | 'volcano'
  | 'castle'
  | 'haunted'
  | 'sky'
  | 'cloud'
  | 'space'
  | 'underground'
  | 'ice_cave'
  | 'candy'
  | 'factory'
  | 'future'
  | 'cyber'
  | 'water';

export interface WorldDef {
  id: WorldId;
  name: string;
  theme: WorldTheme;
  levelIds: LevelId[];
  unlocked: boolean;
}

export interface LevelDef {
  id: LevelId;
  worldId: WorldId;
  name: string;
  index: number;
  checkpointCount: number;
  starCount: number;
  coinCount: number;
  hasBoss: boolean;
  hasMiniBoss: boolean;
}

// ─── Graphics & Audio Settings ─────────────────────────────────────────────────

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type ShadowQuality = 'off' | 'low' | 'medium' | 'high';
export type DifficultyProfile = 'easy' | 'normal' | 'hard' | 'expert';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: GraphicsQuality;
  shadowQuality: ShadowQuality;
  bloomEnabled: boolean;
  ssaoEnabled: boolean;
  volumetricFog: boolean;
  fullscreen: boolean;
  vsync: boolean;
  targetFps: number;
  cameraDistance: number;
  cameraSensitivity: number;
  invertY: boolean;
  showMinimap: boolean;
  showQuestTracker: boolean;
  muted: boolean;
  difficulty: DifficultyProfile;
  language: string;
}

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  graphicsQuality: 'high',
  shadowQuality: 'medium',
  bloomEnabled: true,
  ssaoEnabled: true,
  volumetricFog: false,
  fullscreen: false,
  vsync: true,
  targetFps: 60,
  cameraDistance: 12,
  cameraSensitivity: 1.0,
  invertY: false,
  showMinimap: true,
  showQuestTracker: true,
  muted: false,
  difficulty: 'normal',
  language: 'en',
};

// ─── Progression & Economy ─────────────────────────────────────────────────────

export interface PlayerProgress {
  currentWorldId: WorldId | null;
  currentLevelId: LevelId | null;
  unlockedWorlds: WorldId[];
  completedLevels: LevelId[];
  collectedStars: Record<LevelId, number>;
  totalCoins: number;
  stats: CharacterStats;
}

export interface GameStatistics {
  totalPlayTime: number;
  totalDeaths: number;
  totalJumps: number;
  totalEnemiesDefeated: number;
  totalCoinsCollected: number;
  totalStarsCollected: number;
  levelsCompleted: number;
  bossesDefeated: number;
}

// ─── Save Data ─────────────────────────────────────────────────────────────────

export const SAVE_VERSION = 1;

export interface SaveData {
  version: number;
  settings: GameSettings;
  progress: PlayerProgress;
  statistics: GameStatistics;
  achievements: string[];
  inventory: string[];
  lastCheckpoint: CheckpointData | null;
  savedAt: number;
}

export interface CheckpointData {
  levelId: LevelId;
  position: Vec3;
  rotation: Quat;
  stats: CharacterStats;
  collectedCoins: number;
  collectedStars: number;
}

// ─── Engine Config ─────────────────────────────────────────────────────────────

export interface EngineConfig {
  fixedTimestep: number;
  simulationHz?: number;
  renderHz?: number;
  maxFrameTime: number;
  gravity: Vec3;
  physicsSubsteps: number;
  poolInitialSize: number;
  poolMaxSize: number;
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  fixedTimestep: 1 / 60,
  maxFrameTime: 0.25,
  gravity: { x: 0, y: -24, z: 0 },
  physicsSubsteps: 4,
  poolInitialSize: 32,
  poolMaxSize: 512,
};

// ─── Input ─────────────────────────────────────────────────────────────────────

export enum InputAction {
  MoveLeft = 'move_left',
  MoveRight = 'move_right',
  MoveForward = 'move_forward',
  MoveBackward = 'move_backward',
  Jump = 'jump',
  Sprint = 'sprint',
  Crouch = 'crouch',
  Attack = 'attack',
  Interact = 'interact',
  CameraLeft = 'camera_left',
  CameraRight = 'camera_right',
  CameraUp = 'camera_up',
  CameraDown = 'camera_down',
  Pause = 'pause',
  Confirm = 'confirm',
  Cancel = 'cancel',
}

export type InputBindings = Record<InputAction, string[]>;

export const DEFAULT_INPUT_BINDINGS: InputBindings = {
  [InputAction.MoveLeft]: ['KeyA', 'ArrowLeft'],
  [InputAction.MoveRight]: ['KeyD', 'ArrowRight'],
  [InputAction.MoveForward]: ['KeyW', 'ArrowUp'],
  [InputAction.MoveBackward]: ['KeyS', 'ArrowDown'],
  [InputAction.Jump]: ['Space'],
  [InputAction.Sprint]: ['ShiftLeft', 'ShiftRight'],
  [InputAction.Crouch]: ['ControlLeft', 'KeyC'],
  [InputAction.Attack]: ['KeyF', 'Mouse0'],
  [InputAction.Interact]: ['KeyE'],
  [InputAction.CameraLeft]: ['KeyQ'],
  [InputAction.CameraRight]: ['KeyR'],
  [InputAction.CameraUp]: ['KeyT'],
  [InputAction.CameraDown]: ['KeyG'],
  [InputAction.Pause]: ['Escape'],
  [InputAction.Confirm]: ['Enter'],
  [InputAction.Cancel]: ['Backspace'],
};
