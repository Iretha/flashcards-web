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
