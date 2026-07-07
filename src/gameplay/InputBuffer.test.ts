import { describe, it, expect } from 'vitest';
import { InputBuffer } from './InputBuffer';

describe('InputBuffer', () => {
  it('buffers jump input', () => {
    const buf = new InputBuffer(0.15, 0.12);
    buf.bufferJump(true, 0);
    expect(buf.jumpBuffered).toBe(true);
  });

  it('coyote time allows late jump', () => {
    const buf = new InputBuffer(0.15, 0.12);
    buf.updateCoyote(true, 0);
    buf.updateCoyote(false, 0);
    buf.bufferJump(true, 0);
    expect(buf.consumeJump()).toBe(true);
  });

  it('decays jump buffer over time', () => {
    const buf = new InputBuffer(0.1, 0.12);
    buf.bufferJump(true, 0);
    buf.bufferJump(false, 0.2);
    expect(buf.jumpBuffered).toBe(false);
  });
});
