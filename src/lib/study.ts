export type Ordering = 'SEQUENTIAL' | 'RANDOM';
export interface Settings { order: Ordering; timer: boolean; seconds: number; onlyUnlearned: boolean }
export const defaults: Settings = { order: 'SEQUENTIAL', timer: true, seconds: 30, onlyUnlearned: true };
export interface QueueCard { id: string; failed: number; visits: number }
export interface StudyState {
  queue: QueueCard[];
  history: string[];
  cursor: number;
  current: string | null;
  revealed: boolean;
  deadline: number | null;
  remainingMs: number | null;
}
export type StudyAction = 'show' | 'learn' | 'repeat' | 'next' | 'previous' | 'forward' | 'timeout' | 'pause' | 'resume';
export type Outcome = 'LEARNED' | 'REPEAT' | 'TIMEOUT' | 'NEXT';

// One ticket for every card, plus one per failure up to seven extra tickets.
export const weight = (failed: number) => 1 + Math.min(7, Math.max(0, failed));

export function choose(queue: QueueCard[], history: string[], order: Ordering, random = Math.random) {
  const cooldown = Math.min(2, Math.max(0, queue.length - 1));
  const recent = new Set(cooldown ? history.slice(-cooldown) : []);
  const eligible = queue.filter(card => !recent.has(card.id));
  const choices = eligible.length ? eligible : queue;
  const fresh = choices.find(card => card.visits === 0);
  const repeats = choices.filter(card => card.visits > 0);
  let pool = choices;
  if (order === 'SEQUENTIAL' && fresh) {
    if (!repeats.length || random() >= 0.3) return fresh;
    pool = repeats;
  }
  let ticket = random() * pool.reduce((total, card) => total + weight(card.failed), 0);
  for (const card of pool) {
    ticket -= weight(card.failed);
    if (ticket < 0) return card;
  }
  return pool.at(-1);
}

function present(state: StudyState, settings: Settings, now: number, random: () => number) {
  const next = choose(state.queue, state.history, settings.order, random);
  state.current = next?.id ?? null;
  state.revealed = false;
  state.remainingMs = null;
  state.deadline = next && settings.timer ? now + settings.seconds * 1000 : null;
  if (next) {
    next.visits++;
    state.history.push(next.id);
    if (state.history.length > 2000) state.history.shift();
  }
  state.cursor = state.history.length - 1;
  return state.current;
}

export function startStudy(queue: QueueCard[], settings: Settings, now: number, random = Math.random) {
  const state: StudyState = {
    queue: queue.map(card => ({ ...card })), history: [], cursor: -1, current: null,
    deadline: null, remainingMs: null, revealed: false,
  };
  present(state, settings, now, random);
  return state;
}

export function advance(original: StudyState, settings: Settings, action: StudyAction, now: number, random = Math.random) {
  const state = structuredClone(original);
  const card = state.current;
  let outcome: Outcome | null = null;
  let shown: string | null = null;
  if (!card) return { state, outcome, shown };
  const historical = state.cursor < state.history.length - 1;

  if (action === 'pause') {
    if (state.deadline !== null) state.remainingMs = Math.max(0, state.deadline - now);
    state.deadline = null;
  } else if (action === 'resume') {
    if (state.remainingMs !== null) state.deadline = now + state.remainingMs;
    state.remainingMs = null;
  } else if (action === 'previous') {
    state.cursor = Math.max(0, state.cursor - 1);
  } else if (historical && (action === 'next' || action === 'forward')) {
    state.cursor++;
  } else if (action === 'show' && !historical && (state.deadline === null || state.deadline > now)) {
    state.revealed = true;
    state.deadline = null;
    state.remainingMs = null;
  } else if (
    (action === 'timeout' && state.deadline !== null && state.deadline <= now) ||
    (!historical && ['learn', 'repeat', 'next'].includes(action))
  ) {
    const expired = state.deadline !== null && state.deadline <= now;
    outcome = expired ? 'TIMEOUT' : action === 'learn' ? 'LEARNED' : action === 'repeat' ? 'REPEAT' : 'NEXT';
    if (outcome === 'LEARNED') state.queue = state.queue.filter(item => item.id !== card);
    if (outcome === 'REPEAT' || outcome === 'TIMEOUT') {
      const entry = state.queue.find(item => item.id === card);
      if (entry) entry.failed++;
    }
    shown = present(state, settings, now, random);
  }
  return { state, outcome, shown };
}
