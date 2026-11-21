import { describe, expect, it } from 'vitest';
import { advance, defaults, startStudy } from '../src/lib/study';

const queue = ['a', 'b', 'c'].map(id => ({ id, failed: 0, visits: 0 }));

describe('study transitions', () => {
  it('keeps navigation independent of repeat membership', () => {
    let state = startStudy(queue, defaults, 0);
    state = advance(state, defaults, 'repeat', 1).state;
    expect(state.current).toBe('a');
    expect(state.cycles?.repeat).toEqual(['a']);
    state = advance(state, defaults, 'next', 2).state;
    expect(state.current).toBe('b');
    state = advance(state, defaults, 'previous', 3).state;
    state = advance(state, defaults, 'repeat', 4).state;
    expect(state.cycles?.repeat).toEqual([]);
  });

  it('shuffles a complete initial pass without inserting marked cards early', () => {
    let state = startStudy(queue, { ...defaults, order: 'RANDOM' }, 0, () => 0);
    expect(state.current).toBe('b');
    state = advance(state, defaults, 'repeat', 1).state;
    state = advance(state, defaults, 'next', 2).state;
    expect(state.current).toBe('c');
    state = advance(state, defaults, 'next', 3).state;
    expect(state.current).toBe('a');
    state = advance(state, defaults, 'next', 4).state;
    expect(state.current).toBe('b');
  });

  it('preserves reveals, stops timer on show, and records no presentation when browsing history', () => {
    const started = startStudy(queue, defaults, 0);
    const revealed = advance(started, defaults, 'show', 1).state;
    expect(revealed).toMatchObject({ revealed: true, deadline: null });
    expect(advance(revealed, defaults, 'timeout', 40_000).state).toEqual(revealed);
    const next = advance(revealed, defaults, 'learn', 100).state;
    const peek = advance(next, defaults, 'previous', 110);
    expect(peek).toMatchObject({ shown: null, outcome: null, state: { cursor: 0 } });
    expect(peek.state.queue).toEqual(next.queue);
    expect(advance(peek.state, defaults, 'repeat', 120).state.cycles?.repeat).toEqual(['a']);
  });

  it('pauses and resumes the remaining duration, expires once, and completes', () => {
    const state = startStudy(queue.slice(0, 1), defaults, 0);
    const paused = advance(state, defaults, 'pause', 5_000).state;
    expect(paused).toMatchObject({ remainingMs: 25_000, deadline: null });
    const resumed = advance(paused, defaults, 'resume', 20_000).state;
    expect(resumed.deadline).toBe(45_000);
    expect(advance(resumed, defaults, 'timeout', 44_999).shown).toBeNull();
    const expired = advance(resumed, defaults, 'timeout', 45_000);
    expect(expired).toMatchObject({ outcome: 'TIMEOUT', shown: null, state: { deadline: null, revealed: true } });
    expect(advance(expired.state, defaults, 'learn', 45_001).state.current).toBeNull();
    expect(startStudy(queue, { ...defaults, timer: false }, 0).deadline).toBeNull();
  });
});
