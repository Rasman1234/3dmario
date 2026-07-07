import { describe, it, expect } from 'vitest';
import { PlayerFeedbackCollector } from './PlayerFeedback';

describe('PlayerFeedbackCollector', () => {
  it('converts feedback to evidence', () => {
    const fb = new PlayerFeedbackCollector();
    const entry = fb.submit('preset-b', {
      responsiveness: 5,
      readability: 4,
      expressiveness: 5,
      enjoyment: 5,
    }, 'Feels great');
    expect(entry.evidenceSummary).toContain('preset-b');
    expect(fb.getSatisfactionScore()).toBeGreaterThan(4);
  });
});
