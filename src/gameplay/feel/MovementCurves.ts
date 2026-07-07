import type { CurveShape } from './FeelConfig';
import { clamp, lerp } from '../../utils/Math';

/** Evaluates acceleration / deceleration / momentum curves (0–1 speed ratio). */

export function evaluateCurve(shape: CurveShape, t: number): number {
  const x = clamp(t, 0, 1);
  if (x <= 0.5) {
    return lerp(shape.start, shape.peak, x * 2);
  }
  return lerp(shape.peak, shape.end, (x - 0.5) * 2);
}

export function curveMoveToward(
  current: number,
  target: number,
  maxSpeed: number,
  dt: number,
  shape: CurveShape,
): number {
  const speedRatio = maxSpeed > 0 ? clamp(Math.abs(current) / maxSpeed, 0, 1) : 0;
  const scale = evaluateCurve(shape, speedRatio);
  const maxDelta = maxSpeed * scale * dt;
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}

export function momentumBlend(current: number, target: number, dt: number, shape: CurveShape): number {
  const ratio = clamp(Math.abs(current) / (Math.abs(target) + 0.001), 0, 1);
  const blend = evaluateCurve(shape, ratio) * dt * 8;
  return current + (target - current) * clamp(blend, 0, 1);
}
