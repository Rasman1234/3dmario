import personalityData from '../../data/personality.json';

export type AnimationPhase =
  | 'jump_anticipation'
  | 'launch'
  | 'hang'
  | 'fall'
  | 'land'
  | 'recovery'
  | 'idle'
  | 'turn'
  | 'run'
  | 'stop'
  | 'victory'
  | 'damage';

export type MoodState =
  | 'idle'
  | 'waiting'
  | 'success'
  | 'damage'
  | 'celebration'
  | 'failure'
  | 'curiosity';

export type ExpressionType =
  | 'long_jump'
  | 'perfect_landing'
  | 'fast_turn'
  | 'wall_jump'
  | 'chain_jump';

export interface PersonalityProfile {
  id: string;
  label: string;
  squashScale: number;
  stretchScale: number;
  anticipationFrames: number;
  hangFrames: number;
  recoveryFrames: number;
  secondaryIntensity: number;
  expressionIntensity: number;
  moodVolatility: number;
}

export interface TransitionConfig {
  duration: number;
  curve: string;
}

export interface PoseChannels {
  bodyY: number;
  torsoLean: number;
  armL: number;
  armR: number;
  legL: number;
  legR: number;
}

export interface PoseSet {
  key: PoseChannels;
  anticipation: PoseChannels;
  transition: PoseChannels;
  recovery: PoseChannels;
}

export interface PersonalityVisualState {
  phase: AnimationPhase;
  phaseT: number;
  pose: PoseChannels;
  squashX: number;
  squashY: number;
  stretch: number;
  secondary: {
    hat: { x: number; y: number; z: number };
    armL: { x: number; z: number };
    armR: { x: number; z: number };
    legL: { x: number };
    legR: { x: number };
    torso: { x: number };
    backpack: { y: number; z: number };
  };
  mood: MoodState;
  expression?: ExpressionType;
  expressionT: number;
}

export const PERSONALITY_BUDGETS = {
  maxTimelineEntries: 64,
  maxExpressions: 32,
  inputVisualBuffer: 8,
} as const;

export function getPersonalities(): PersonalityProfile[] {
  return personalityData.personalities as PersonalityProfile[];
}

export function getActivePersonality(): PersonalityProfile {
  const id = personalityData.active;
  return getPersonalities().find((p) => p.id === id) ?? getPersonalities()[0];
}

export function getTransitions(): Record<string, TransitionConfig> {
  return personalityData.transitions as Record<string, TransitionConfig>;
}
