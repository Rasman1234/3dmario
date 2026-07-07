import { describe, it, expect } from 'vitest';
import { MovementRegression } from './MovementRegression';
import { getAllPresets } from './FeelConfig';

describe('MovementRegression', () => {
  it('passes when rating meets baseline', () => {
    const r = new MovementRegression();
    r.setBaseline({ bestRating: 0.6, latestRating: 0.6, telemetryAvgRating: 0.6 });
    const preset = getAllPresets()[1];
    const result = r.evaluate({ preset, avgRating: 0.72 });
    expect(result.passed).toBe(true);
  });

  it('rejects significant regression', () => {
    const r = new MovementRegression();
    r.setBaseline({ bestRating: 0.75, latestRating: 0.7, telemetryAvgRating: 0.7 });
    const preset = getAllPresets()[0];
    const result = r.evaluate({ preset, avgRating: 0.5 });
    expect(result.passed).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
