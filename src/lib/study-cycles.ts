/** Session-local repetition. History is immutable; repeat membership is editable. */
export interface CycleState {
  cards: string[];
  pending: string[];
  repeat: string[];
  history: string[];
  cursor: number;
  complete: boolean;
  cycle: number;
}

export function startCycles(ids: string[]): CycleState {
  const cards = [...new Set(ids)];
  return { cycle: 0, cards, pending: cards.slice(1), repeat: [], history: cards.slice(0, 1), cursor: 0, complete: !cards.length };
}

export function toggleRepeat(original: CycleState): CycleState {
  const state = structuredClone(original);
  const id = state.history[state.cursor];
  if (!id || state.complete) return state;
  state.repeat = state.repeat.includes(id) ? state.repeat.filter(value => value !== id) : [...state.repeat, id];
  if (state.cycle > 0 && !state.repeat.includes(id)) state.pending = state.pending.filter(value => value !== id);
  return state;
}

export function previousCycleCard(original: CycleState): CycleState {
  return { ...structuredClone(original), cursor: Math.max(0, original.cursor - 1) };
}

export function nextCycleCard(original: CycleState): CycleState {
  const state = structuredClone(original);
  if (state.complete) return state;
  if (state.cursor < state.history.length - 1) {
    state.cursor++;
    return state;
  }
  // The first pass is unconditional. Later pending entries must still be marked.
  if (state.cycle > 0) state.pending = state.pending.filter(id => state.repeat.includes(id));
  if (!state.pending.length) {
    state.cycle++;
    state.pending = state.cards.filter(id => state.repeat.includes(id));
  }
  const next = state.pending.shift();
  if (!next) state.complete = true;
  else {
    state.history.push(next);
    state.cursor++;
  }
  return state;
}
