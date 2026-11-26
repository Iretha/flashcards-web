import { expect, it } from 'vitest';
import { adaptStudyState, projectStudy, projectionOptions } from '../src/lib/study-projection';
import type { ProjectionCard } from '../src/lib/study-projection';
import { advance, defaults, startStudy } from '../src/lib/study';
import type { StudyState } from '../src/lib/study';
const card = (id: string, topics: string[] = []): ProjectionCard => ({ id, topics, priority: 3, likelihood: 3, creationMode: 'UNKNOWN', metadata: { cardType: 'question', occurrenceCount: 0 } });
const scope = ['c', 'a', 'b'].map(id => card(id));
const strip = (state: StudyState) => {
  const result = structuredClone(state);
  delete result.schemaVersion; delete result.classification;
  if (result.cycles) delete result.cycles.live;
  return result;
};

it.each([0, 1, 2, 9])('restores cycle %i without inferring passed history or changing timer, shuffle, cursor or Repeat', cycle => {
  const state = strip(startStudy(scope, { ...defaults, timer: true }, 10));
  Object.assign(state.cycles!, { cycle, history: ['c', 'a', 'b', 'c', 'a', 'b'], pending: ['a'], repeat: ['b', 'a'], cursor: 1 });
  Object.assign(state, { history: [...state.cycles!.history], cursor: 1, current: 'a', revealed: true, historyRevealed: true,
    deadline: 12345, remainingMs: 234, answerOverrides: { a: true }, language: 'bg' });
  const restored = adaptStudyState(state);
  expect(strip(restored)).toEqual(state);
  expect(restored.cycles!.live).toMatchObject({ passed: [], frontier: 'b', members: ['a', 'b'], originalOrder: ['c', 'a', 'b'] });
  expect(restored.classification!.filters.topics).toEqual({ values: [], includeNoTopics: false });
  expect(strip(projectStudy(restored, scope, defaults, 999))).toEqual(state);
  expect(adaptStudyState(restored)).toEqual(restored);
  // Both versions use the same engine and must have identical unfiltered transitions.
  let old = state; let current = restored;
  for (const action of ['next', 'repeat', 'previous', 'next', 'next', 'next', 'next'] as const) {
    old = advance(old, defaults, action, 100).state;
    current = advance(projectStudy(current, scope, defaults, 100), defaults, action, 100).state;
    expect(strip(current)).toEqual(old);
  }
});

it('keeps completed restoration terminal and diagnoses malformed cycle state', () => {
  let state = startStudy([card('a')], defaults, 0);
  state = strip(advance(state, defaults, 'next', 1).state);
  const restored = adaptStudyState(state);
  expect(strip(projectStudy(restored, [card('a'), card('b')], defaults, 2))).toEqual(state);
  expect(() => adaptStudyState({ ...state, cycles: { ...state.cycles!, cursor: 900 } })).toThrow('Malformed');
});

it('appends new ranks once, retains frontier/timer, and admits new cards in a Repeat cycle only once', () => {
  let state = startStudy([card('a')], { ...defaults, timer: true }, 0);
  state = advance(state, defaults, 'repeat', 1).state;
  state = advance(state, defaults, 'next', 2).state;
  const deadline = state.deadline;
  state = projectStudy(state, [card('a'), card('b')], defaults, 3);
  expect(state.current).toBe('a'); expect(state.deadline).toBe(deadline);
  expect(state.cycles!.pending).toEqual(['b']);
  state = advance(state, defaults, 'next', 4).state;
  expect(state.current).toBe('b');
  state = advance(state, defaults, 'next', 5).state;
  expect(state.current).toBe('a');
  state = projectStudy(state, [card('a'), card('b')], defaults, 6);
  expect(state.cycles!.pending).toEqual([]);
  expect(state.cycles!.live!.originalOrder).toEqual(['a', 'b']);
});

it('preserves passed, Repeat and ranks across exclusion and reinclusion with No Topics', () => {
  let state = startStudy(['a', 'b', 'c'].map(id => card(id)), defaults, 0);
  state = advance(state, defaults, 'next', 1).state;
  state.classification!.filters.topics = { values: [], includeNoTopics: true };
  state = projectStudy(state, [card('a'), card('b', ['X']), card('c')], defaults, 2);
  expect(state.current).toBe('c');
  state = projectStudy(state, [card('a'), card('b'), card('c')], defaults, 3);
  expect(state.current).toBe('c'); expect(state.cycles!.pending).toEqual(['b']);
  expect(state.cycles!.live!.passed).toEqual(['a']);
  expect(projectionOptions([card('a', ['NO TOPICS']), card('b')])).toMatchObject({ topics: ['NO TOPICS'], noTopicsAvailable: true });
});

it('retains new admission through temporary exclusion, and accepts ordinary active growth above 5000', () => {
  let state = startStudy([card('a')], defaults, 0);
  state = advance(state, defaults, 'repeat', 1).state;
  state = advance(state, defaults, 'next', 2).state;
  state.classification!.filters.topics.includeNoTopics = true;
  state = projectStudy(state, [card('a'), card('b', ['X'])], defaults, 3);
  expect(state.cycles!.pending).toEqual([]);
  state = projectStudy(state, [card('a'), card('b')], defaults, 4);
  expect(state.cycles!.pending).toEqual(['b']);
  const cards = Array.from({ length: 5002 }, (_, i) => card(String(i)));
  state = projectStudy(state, [card('a'), card('b'), ...cards], defaults, 5);
  expect(state.cycles!.pending).toHaveLength(5003);
});

it('preserves actual shuffled ranks and original queue bytes while restoring random sessions', () => {
  const original = strip(startStudy(scope, { ...defaults, order: 'RANDOM', timer: true }, 123, () => 0));
  expect(original.cycles!.cards).not.toEqual(original.queue.map(card => card.id));
  expect(strip(projectStudy(original, scope, defaults, 999))).toEqual(original);
});

it('matches unfiltered legacy transitions across natural cycles and historical Repeat edits', () => {
  let old = strip(startStudy(scope, defaults, 0));
  let restored = adaptStudyState(old);
  let seed = 79;
  const actions = ['next', 'next', 'repeat', 'previous', 'show'] as const;
  for (let i = 0; i < 200; i++) {
    seed = (seed * 16807) % 2147483647;
    const action = actions[seed % actions.length];
    old = advance(old, defaults, action, i).state;
    restored = advance(projectStudy(restored, scope, defaults, i), defaults, action, i).state;
    expect(strip(restored)).toEqual(old);
  }
});

it('browses retained accessible history from an empty frontier without consuming work', () => {
  let state = startStudy([card('a'), card('b')], defaults, 0);
  state = advance(state, defaults, 'next', 1).state;
  state.classification!.filters.topics.values = ['MISSING'];
  state = projectStudy(state, [card('a'), card('b')], defaults, 2);
  expect(state.current).toBe('b');
  expect(state.cycles!.live!.frontier).toBeNull();
  const live = structuredClone(state.cycles!.live);
  const result = advance(state, defaults, 'previous', 3);
  expect(result).toMatchObject({ shown: null, outcome: null, state: { current: 'a', cursor: 0 } });
  expect(result.state.cycles!.live).toEqual(live);
  expect(result.state.cycles!.complete).toBe(true);
});

it('never reopens terminal exhaustion when access and matching work return', () => {
  let state = startStudy([card('a'), card('b')], { ...defaults, timer: true }, 0);
  state = advance(state, defaults, 'next', 1).state;
  state = advance(state, defaults, 'previous', 2).state;
  state.classification!.filters.topics.values = ['MISSING'];
  state = projectStudy(state, [card('a'), card('b')], defaults, 3);
  state = projectStudy(state, [], defaults, 4);
  expect(state.current).toBeNull();
  expect(state.deadline).toBeNull();
  expect(state.cycles!.complete).toBe(true);
  state.classification!.filters.topics.values = [];
  const recovered = projectStudy(state, [card('a'), card('b')], { ...defaults, timer: true }, 100);
  expect(recovered).toMatchObject({ current: 'a', deadline: null });
  expect(recovered.cycles!.live).toMatchObject({ frontier: null, passed: ['a'] });
  expect(recovered.cycles!.pending).toEqual([]);
});

it('keeps empty-frontier no-op navigation empty and never consumes retained history', () => {
  let state = startStudy([card('a')], defaults, 0);
  state.classification!.filters.topics.values = ['MISSING'];
  state = projectStudy(state, [card('a')], defaults, 1);
  for (const action of ['previous', 'next', 'forward', 'learn'] as const) {
    const result = advance(state, defaults, action, 2);
    expect(result).toMatchObject({ state: { current: 'a' }, outcome: null, shown: null });
    expect(result.state.cycles).toEqual(state.cycles);
  }
});

it('Apply reorders pending only, preserves frontier and history timer state, and restores default ranks', () => {
  const cards = [card('a'), { ...card('b'), priority: 5 as const }, { ...card('c'), priority: 1 as const }];
  let state = startStudy(cards, { ...defaults, timer: true }, 0);
  const deadline = state.deadline;
  state.classification!.sorting = { field: 'priority', direction: 'asc' };
  state = projectStudy(state, cards, defaults, 50, true);
  expect(state).toMatchObject({ current: 'a', history: ['a'], deadline });
  expect(state.cycles!.pending).toEqual(['c', 'b']);
  state.classification!.sorting = { field: 'default', direction: 'asc' };
  state = projectStudy(state, cards, defaults, 100, true);
  expect(state.cycles!.pending).toEqual(['b', 'c']);
});

it('circular history navigation never consumes work; active Next at the frontier still advances', () => {
  let state = startStudy([card('a'), card('b'), card('c')], defaults, 0);
  state = advance(state, defaults, 'next', 1).state;
  state = advance(state, defaults, 'previous', 2).state;
  const before = structuredClone(state.cycles!.live);
  const wrap = advance(state, defaults, 'previous', 3);
  expect(wrap).toMatchObject({ shown: null, outcome: null, state: { current: 'b', cursor: 1 } });
  expect(wrap.state.cycles!.live).toEqual(before);
  const next = advance(wrap.state, defaults, 'next', 4);
  expect(next).toMatchObject({ shown: 'c', state: { current: 'c' } });
  state = advance(next.state, defaults, 'next', 5).state;
  expect(state.cycles!.complete).toBe(true);
  const completed = advance(state, defaults, 'next', 6);
  expect(completed).toMatchObject({ shown: null, outcome: null, state: { current: 'a' } });
  expect(completed.state.cycles!.live!.passed).toEqual(['a', 'b', 'c']);
});

it('completed circular navigation skips inaccessible entries and preserves repeated history positions', () => {
  let state = startStudy([card('a'), card('b'), card('c')], defaults, 0);
  state.cycles!.history = ['a', 'b', 'a', 'c']; state.history = [...state.cycles!.history];
  state.cycles!.cursor = 0; state.cursor = 0; state.current = 'a'; state.cycles!.complete = true;
  state.cycles!.live!.frontier = null; state.cycles!.live!.accessible = ['a', 'c'];
  state = advance(state, defaults, 'previous', 1).state;
  expect(state).toMatchObject({ cursor: 3, current: 'c' });
  state = advance(state, defaults, 'next', 2).state;
  expect(state.cursor).toBe(0);
  const repeated = advance(state, defaults, 'next', 3);
  expect(repeated).toMatchObject({ outcome: null, shown: null, state: { cursor: 2, current: 'a' } });
});

it('Apply from paused history preserves timer bytes, answer overrides and Repeat when the frontier remains eligible', () => {
  const cards = [card('a'), { ...card('b'), metadata: { cardType: 'task' as const, occurrenceCount: 0 } }, card('c')];
  const timed = { ...defaults, timer: true };
  let state = startStudy(cards, timed, 0);
  state = advance(state, timed, 'repeat', 1).state;
  state = advance(state, timed, 'next', 2).state;
  state = advance(state, timed, 'previous', 3).state;
  state = advance(state, timed, 'pause', 4).state;
  const before = structuredClone(state);
  state.classification!.filters.cardTypes = ['task'];
  state = projectStudy(state, cards, timed, 900, true);
  expect(state).toMatchObject({ current: 'a', cursor: before.cursor, history: before.history,
    deadline: before.deadline, remainingMs: before.remainingMs, revealed: before.revealed,
    answerOverrides: before.answerOverrides, cycles: { repeat: ['a'], live: { frontier: 'b', passed: ['a'] } } });
});

it.each([true, false])('exhaustion without frontier consumption stays terminal (Apply=%s)', apply => {
  const cards = [card('a'), card('b', apply ? ['X'] : [])];
  let state = startStudy(cards, defaults, 0);
  state = advance(state, defaults, 'repeat', 1).state;
  state = advance(state, defaults, 'next', 2).state;
  state.classification!.filters.topics.includeNoTopics = true;
  if (!apply) state = projectStudy(state, cards, defaults, 3, true);
  state = projectStudy(state, [cards[0], card('b', ['X'])], defaults, 4, apply);
  expect(state.cycles).toMatchObject({
    complete: true, cycle: 0, repeat: ['a'], pending: [], history: ['a', 'b'],
    live: { frontier: null, passed: ['a'], eligible: ['a'] },
  });
  expect(projectStudy(state, [cards[0], card('b')], defaults, 5).cycles).toMatchObject({
    complete: true, cycle: 0, live: { frontier: null },
  });
});

it.each(['running', 'paused', 'revealed'] as const)('Apply replaces the frontier while history is %s', mode => {
  const cards = [card('a', ['X']), card('b', ['X']), card('c')];
  const settings = { ...defaults, timer: true };
  let state = startStudy(cards, settings, 0);
  state = advance(state, settings, 'next', 1).state;
  state = advance(state, settings, 'previous', 2).state;
  if (mode === 'paused') state = advance(state, settings, 'pause', 3).state;
  if (mode === 'revealed') state = advance(state, settings, 'show', 3).state;
  const { deadline, remainingMs, revealed, historyRevealed, answerOverrides } = state;
  state.classification!.filters.topics.includeNoTopics = true;
  state = projectStudy(state, cards, settings, 100, true);
  expect(state).toMatchObject({
    current: 'a', cursor: 0, history: ['a', 'b', 'c'],
    deadline, remainingMs, revealed, historyRevealed, answerOverrides,
    cycles: { live: { frontier: 'c' } },
  });
  state = projectStudy(state, [cards[0], cards[2]], settings, 101);
  expect(advance(state, settings, 'next', 200)).toMatchObject({
    shown: null, outcome: null,
    state: { current: 'c', deadline: 30200, remainingMs: null, revealed: false, historyRevealed: false },
  });
});
