import { describe, it, expect } from 'vitest';
import { FeelTimeline } from './FeelTimeline';

describe('FeelTimeline', () => {
  it('records pipeline stages in order', () => {
    const tl = new FeelTimeline();
    tl.mark('input', 'jump');
    tl.mark('animation', 'launch');
    tl.mark('physics', 'step');
    const flow = tl.getFlow();
    expect(flow).toHaveLength(3);
    expect(flow[0].stage).toBe('input');
    expect(tl.renderAscii()).toContain('input');
  });
});
