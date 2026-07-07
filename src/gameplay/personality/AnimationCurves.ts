import { clamp, lerp } from '../../utils/Math';
import type { TransitionConfig } from './types';

/** Animation curves — expressive, decoupled from deterministic movement curves. */

export function evaluateAnimCurve(curve: string, t: number): number {
  const x = clamp(t, 0, 1);
  switch (curve) {
    case 'ease_in':
      return x * x;
    case 'ease_out':
      return 1 - (1 - x) ** 2;
    case 'ease_in_out':
      return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
    case 'snap':
      return x < 0.5 ? 0 : 1;
    case 'hold':
      return x < 0.8 ? 1 : 1 - (x - 0.8) / 0.2;
    case 'bounce':
      return Math.abs(Math.sin(x * Math.PI * 2)) * (1 - x) + x;
    case 'shake':
      return x + Math.sin(x * 40) * 0.05 * (1 - x);
  }
  return x;
}

export function blendTransition(
  from: number,
  to: number,
  t: number,
  config: TransitionConfig,
): number {
  const eased = evaluateAnimCurve(config.curve, t);
  return lerp(from, to, eased);
}

export function phaseProgress(elapsed: number, config: TransitionConfig): number {
  return clamp(elapsed / Math.max(0.001, config.duration), 0, 1);
}
