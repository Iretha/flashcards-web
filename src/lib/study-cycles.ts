/** Session-local repetition. History is immutable; repeat membership is editable. */
export interface CycleState {
  live?: {
    originalOrder: string[];
    passed: string[];
    admittedNew: string[];
    frontier: string | null;
    completionReason: 'COMPLETE' | null;
    /** Cycle admission snapshot; restoration copies only the stored remaining work. */
    members: string[];
    eligible: string[];
    accessible: string[];
  };
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
  if (state.cycle > 0 && !state.repeat.includes(id) && !state.live?.admittedNew.includes(id)) {
    state.pending = state.pending.filter(value => value !== id);
    if (state.live && id !== state.live.frontier) state.live.members = state.live.members.filter(value => value !== id);
  }
  return state;
}

function browse(original: CycleState, direction: -1 | 1, wrap: boolean): CycleState {
  const state = structuredClone(original);
  const accessible = state.live && new Set(state.live.accessible);
  for (let step = 1; step <= state.history.length; step++) {
    const index = state.cursor + direction * step;
    if (!wrap && (index < 0 || index >= state.history.length)) break;
    const cursor = ((index % state.history.length) + state.history.length) % state.history.length;
    if (!accessible || accessible.has(state.history[cursor])) { state.cursor = cursor; break; }
  }
  return state;
}

export function previousCycleCard(original: CycleState): CycleState { return browse(original, -1, true); }

export function nextCycleCard(original: CycleState): CycleState {
  const state = structuredClone(original);
  if (state.complete) return browse(state, 1, true);
  if (state.cursor < state.history.length - 1) return browse(state, 1, false);
  if (state.live && !state.live.frontier) return state;
  // The first pass is unconditional. Later pending entries must still be marked.
  const live = state.live;
  if (live?.frontier) live.passed = [...new Set([...live.passed, live.frontier])];
  if (state.cycle > 0) state.pending = state.pending.filter(id => state.repeat.includes(id) || live?.admittedNew.includes(id));
  if (!state.pending.length) {
    const marked = new Set(state.repeat);
    state.pending = (live ? live.eligible : state.cards).filter(id => marked.has(id));
    if (state.pending.length) {
      state.cycle++;
      if (live) { live.passed = []; live.admittedNew = []; live.members = [...state.pending]; }
    }
  }
  const next = state.pending.shift();
  if (live) { live.frontier = next ?? null; live.completionReason = next ? null : 'COMPLETE'; }
  if (!next) state.complete = true;
  else {
    state.history.push(next);
    state.cursor++;
  }
  return state;
}
