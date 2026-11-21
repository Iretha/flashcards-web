import { expect, it } from 'vitest';
import { startCycles, toggleRepeat, nextCycleCard, previousCycleCard } from '../src/lib/study-cycles';

it('finishes the initial deck before repeating and completes with empty membership', () => {
  let state = toggleRepeat(startCycles(['a', 'b', 'a']));
  expect(state.history).toEqual(['a']);
  state = nextCycleCard(state);
  expect(state.history).toEqual(['a', 'b']);
  state = nextCycleCard(state);
  expect(state.history).toEqual(['a', 'b', 'a']);
  state = toggleRepeat(state);
  expect(nextCycleCard(state).complete).toBe(true);
});

it('allows membership changes through history across cycle boundaries', () => {
  let state = toggleRepeat(startCycles(['a', 'b']));
  state = nextCycleCard(state);
  state = nextCycleCard(state);
  state = previousCycleCard(state);
  state = toggleRepeat(state);
  expect(state.repeat).toEqual(['a', 'b']);
  state = nextCycleCard(state);
  expect(state.history).toEqual(['a', 'b', 'a']);
  expect(state.repeat).toEqual(['a', 'b']);
  expect(nextCycleCard(state).history).toEqual(['a', 'b', 'a', 'a']);
});
