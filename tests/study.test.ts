import { describe, expect, it } from 'vitest';
import { advance, choose, defaults, startStudy, weight } from '../src/lib/study';

const queue = ['a', 'b', 'c'].map(id => ({ id, failed: 0, visits: 0 }));

describe('study transitions', () => {
  it('keeps first presentations in deck order and cools down repeats', () => {
    let state = startStudy(queue, defaults, 0, () => 0);
    expect(state.current).toBe('a');
    ({ state } = advance(state, defaults, 'repeat', 100, () => 0));
    expect(state.current).toBe('b');
    expect(state.queue.find(card => card.id === 'a')?.failed).toBe(1);
    ({ state } = advance(state, defaults, 'next', 200, () => 0));
    expect(state.current).toBe('c');
    ({ state } = advance(state, defaults, 'learn', 300, () => 0));
    expect(state.current).toBe('a');
  });

  it('uses capped weighting and gives new cards a nonzero chance', () => {
    const cards = [queue[0], { ...queue[1], failed: 100 }];
    expect(weight(100)).toBe(8);
    const choices = Array.from({ length: 90 }, (_, i) => choose(cards, [], 'RANDOM', () => (i + 0.5) / 90)?.id);
    expect(choices.filter(id => id === 'a')).toHaveLength(10);
    expect(choices.filter(id => id === 'b')).toHaveLength(80);
    expect(choose(cards, ['b'], 'RANDOM', () => 0.99)?.id).toBe('a');
    expect(choose(cards.slice(1), ['b'], 'RANDOM', () => 0)?.id).toBe('b');
    expect(startStudy(queue, { ...defaults, order: 'RANDOM' }, 0, () => 0.99).current).toBe('c');
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
    expect(advance(peek.state, defaults, 'learn', 120).state).toEqual(peek.state);
  });

  it('pauses and resumes the remaining duration, expires once, and completes', () => {
    const state = startStudy(queue.slice(0, 1), defaults, 0);
    const paused = advance(state, defaults, 'pause', 5_000).state;
    expect(paused).toMatchObject({ remainingMs: 25_000, deadline: null });
    const resumed = advance(paused, defaults, 'resume', 20_000).state;
    expect(resumed.deadline).toBe(45_000);
    expect(advance(resumed, defaults, 'timeout', 44_999).shown).toBeNull();
    const expired = advance(resumed, defaults, 'timeout', 45_000);
    expect(expired).toMatchObject({ outcome: 'TIMEOUT', shown: 'a', state: { deadline: 75_000 } });
    expect(advance(expired.state, defaults, 'learn', 45_001).state.current).toBeNull();
    expect(startStudy(queue, { ...defaults, timer: false }, 0).deadline).toBeNull();
  });
});
