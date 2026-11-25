import { adaptStudyState } from './study-projection';
import type { ClassificationFilters, ClassificationSort } from './classification';
import { startCycles, toggleRepeat, nextCycleCard, previousCycleCard } from './study-cycles';
import type { CycleState } from './study-cycles';
import type { Language } from './translations';

export type Ordering = 'SEQUENTIAL' | 'RANDOM';
export interface Settings { order: Ordering; timer: boolean; seconds: number; onlyUnlearned: boolean; language: Language; answersOpen?: boolean }
export const defaults: Settings = { order: 'SEQUENTIAL', timer: false, seconds: 30, onlyUnlearned: false, language: 'en', answersOpen: false };
export interface QueueCard { id: string }
export interface StudyState {
  schemaVersion?: 2;
  classification?: { filters: ClassificationFilters; sorting: ClassificationSort };
  cycles?: CycleState;
  queue: QueueCard[];
  history: string[];
  cursor: number;
  current: string | null;
  revealed: boolean;
  answersOpen?: boolean;
  answerOverrides?: Record<string, boolean>;
  deadline: number | null;
  remainingMs: number | null;
  language?: Language;
  historyRevealed?: boolean;
}
export type StudyAction = 'show' | 'learn' | 'repeat' | 'next' | 'previous' | 'forward' | 'timeout' | 'pause' | 'resume' | 'language';
export type Outcome = 'LEARNED' | 'REPEAT' | 'TIMEOUT' | 'NEXT';

export function startStudy(queue: QueueCard[], settings: Settings, now: number, random = Math.random) {
  const state: StudyState = {
    queue: queue.map(card => ({ id: card.id })), history: [], cursor: -1, current: null,
    deadline: null, remainingMs: null, revealed: settings.answersOpen ?? false, language: settings.language,
    answersOpen: settings.answersOpen ?? false, answerOverrides: {},
  };
  const ids = state.queue.map(card => card.id);
  if (settings.order === 'RANDOM') for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  state.cycles = startCycles(ids);
  state.current = ids[0] ?? null;
  state.history = state.cycles.history;
  state.cursor = 0;
  state.deadline = state.current && settings.timer && !state.revealed ? now + settings.seconds * 1000 : null;
  return adaptStudyState(state, false);
}

export function advance(original: StudyState, settings: Settings, action: StudyAction, now: number, _random = Math.random) {
  const state = structuredClone(original);
  const card = state.current;
  let outcome: Outcome | null = null;
  let shown: string | null = null;
  if (!card && (action !== 'previous' || state.cycles?.complete)) return { state, outcome, shown };
  if (state.cycles) {
    const cycles = state.cycles;
    if (action === 'repeat') state.cycles = toggleRepeat(cycles);
    else if (action === 'previous') state.cycles = previousCycleCard(cycles);
    else if (action === 'next' || action === 'forward' || action === 'learn') {
      state.cycles = nextCycleCard(cycles);
      outcome = action === 'learn' ? 'LEARNED' : 'NEXT';
    } else if (action === 'show' && card) {
      state.revealed = !state.revealed;
      (state.answerOverrides ??= {})[card] = state.revealed;
      state.deadline = null; state.remainingMs = null;
    } else if (action === 'timeout' && state.deadline !== null && state.deadline <= now) {
      // Expiry reveals the answer; it never changes repeat membership or navigates.
      state.revealed = true; state.deadline = null; state.remainingMs = null;
      outcome = 'TIMEOUT';
    } else if (action === 'pause') {
      if (state.deadline !== null) state.remainingMs = Math.max(0, state.deadline - now);
      state.deadline = null;
    } else if (action === 'resume') {
      if (state.remainingMs !== null) state.deadline = now + state.remainingMs;
      state.remainingMs = null;
    }
    const moved = state.cycles.cursor !== cycles.cursor || state.cycles.complete !== cycles.complete;
    state.history = state.cycles.history;
    state.cursor = state.cycles.cursor;
    if (moved) {
      state.current = state.cycles.complete ? null : state.history[state.cursor] ?? null;
      state.revealed = state.current ? state.answerOverrides?.[state.current] ?? state.answersOpen ?? false : false;
      state.historyRevealed = state.revealed;
      state.remainingMs = null;
      state.deadline = state.current && settings.timer && !state.revealed ? now + settings.seconds * 1000 : null;
      if (state.history.length > cycles.history.length) shown = state.current;
    }
    state.historyRevealed = state.revealed;
    return { state, outcome, shown };
  }
  // Pre-v3 sessions are exposed as invalidated by the API and must be restarted.
  return { state, outcome, shown };
}

/** Drop retired extras while preserving valid cycle/history/progress state. */
export function normalizeStudyState(value: StudyState & { explanation?: unknown }): StudyState {
  const { explanation: _retired, ...state } = value;
  return adaptStudyState({ ...state, queue: state.queue.map(card => ({ id: card.id })) });
}
