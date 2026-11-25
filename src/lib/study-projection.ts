import { matchesClassification, compareUnicodeScalars, classificationComparator } from './classification';
import type { CanonicalClassification } from './classification';
import type { StudyState, Settings } from './study';

export interface ProjectionCard extends CanonicalClassification { id: string }

/** Versioning adds metadata only: legacy pending and history remain authoritative. */
export function adaptStudyState(original: StudyState, restored = true): StudyState {
  const state = structuredClone(original);
  if (state.schemaVersion !== undefined && state.schemaVersion !== 2) throw new Error('Unsupported study state version.');
  if (state.schemaVersion === 2) {
    if (!state.classification || !state.cycles?.live) throw new Error('Malformed versioned study session.');
    return state;
  }
  if (!state.cycles) return state;
  const c = state.cycles;
  if (![c.cards, c.pending, c.repeat, c.history].every(value => Array.isArray(value) && value.every(id => typeof id === 'string')) ||
      !Number.isInteger(c.cursor) || c.cursor < 0 || (c.history.length > 0 && c.cursor >= c.history.length) ||
      !Number.isInteger(c.cycle) || c.cycle < 0 || typeof c.complete !== 'boolean' ||
      state.cursor !== c.cursor || JSON.stringify(state.history) !== JSON.stringify(c.history) ||
      state.current !== (c.complete ? null : c.history[c.cursor] ?? null)) {
    throw new Error('Malformed cycle-aware study session.');
  }
  const frontier = c.complete ? null : c.history.at(-1) ?? null;
  state.schemaVersion = 2;
  state.classification = {
    filters: { topics: { values: [], includeNoTopics: false }, priorities: [], likelihoods: [], creationModes: [], cardTypes: [] },
    sorting: { field: 'default', direction: 'asc' },
  };
  c.live = { originalOrder: [...c.cards], passed: [], admittedNew: [], frontier, completionReason: c.complete ? 'COMPLETE' : null, eligible: [...c.cards], accessible: [...c.cards],
    members: restored ? [...c.pending, ...(frontier ? [frontier] : [])] : [...c.cards] };
  return state;
}

/** Read-time reconciliation only appends; sorting existing pending belongs to Apply. */
export function projectStudy(original: StudyState, cards: ProjectionCard[], settings: Settings, now: number): StudyState {
  const state = adaptStudyState(original);
  const c = state.cycles;
  const live = c?.live;
  if (!c || !live || !state.classification || c.complete) return state;
  const accessible = new Set(cards.map(card => card.id));
  live.accessible = [...accessible];
  const known = new Set(live.originalOrder);
  for (const card of cards) if (!known.has(card.id)) {
    known.add(card.id); live.originalOrder.push(card.id); live.admittedNew.push(card.id);
  }
  const matching = cards.filter(card => matchesClassification(state.classification!.filters, card));
  const ranks = new Map(live.originalOrder.map((id, index) => [id, index]));
  live.eligible = matching.map(card => ({ ...card, originalRank: ranks.get(card.id)! }))
    .sort(classificationComparator(state.classification.sorting)).map(card => card.id);
  const passed = new Set(live.passed);
  const repeat = new Set(c.repeat);
  const admitted = new Set(live.admittedNew);
  const members = new Set(live.members);
  const eligible = new Set(matching.filter(card => !passed.has(card.id) &&
    (members.has(card.id) || admitted.has(card.id)) &&
    (c.cycle === 0 || repeat.has(card.id) || admitted.has(card.id) || card.id === live.frontier))
    .map(card => card.id));
  const oldFrontier = live.frontier;
  if (live.frontier && !eligible.has(live.frontier)) live.frontier = null;
  c.pending = c.pending.filter(id => eligible.has(id) && id !== live.frontier);
  const queued = new Set(c.pending);
  // Discovery ranks are the stable default order; no live resort on key changes.
  for (const id of live.originalOrder) if (eligible.has(id) && id !== live.frontier && !queued.has(id)) {
    c.pending.push(id); queued.add(id);
  }
  if (!live.frontier) live.frontier = c.pending.shift() ?? null;
  const browsing = state.current !== null && c.cursor < c.history.length - 1 && accessible.has(c.history[c.cursor]);
  if (live.frontier !== oldFrontier) {
    if (live.frontier) c.history.push(live.frontier);
    if (!browsing) {
      c.cursor = Math.max(0, c.history.length - 1);
      state.current = live.frontier;
      state.revealed = state.current ? state.answerOverrides?.[state.current] ?? state.answersOpen ?? false : false;
      state.historyRevealed = state.revealed;
      state.remainingMs = null;
      state.deadline = state.current && settings.timer && !state.revealed ? now + settings.seconds * 1000 : null;
    }
  }
  if (state.current && !accessible.has(state.current)) {
    let index = Math.min(c.cursor, c.history.length - 1);
    while (index >= 0 && !accessible.has(c.history[index])) index--;
    if (index < 0) index = c.history.findIndex(id => accessible.has(id));
    c.cursor = Math.max(0, index); state.current = index >= 0 ? c.history[index] : live.frontier;
    state.deadline = null; state.remainingMs = null;
  }
  c.cards = [...live.originalOrder];
  state.history = c.history; state.cursor = c.cursor;
  const queuedIds = new Set(state.queue.map(card => card.id));
  state.queue.push(...live.originalOrder.filter(id => !queuedIds.has(id)).map(id => ({ id })));
  return state;
}

export function projectionOptions(cards: ProjectionCard[]) {
  return { topics: [...new Set(cards.flatMap(card => card.topics))].sort(compareUnicodeScalars),
    noTopicsAvailable: cards.some(card => !card.topics.length),
    priorities: [...new Set(cards.map(card => card.priority))].sort(),
    likelihoods: [...new Set(cards.map(card => card.likelihood))].sort(),
    creationModes: [...new Set(cards.map(card => card.creationMode))].sort(),
    cardTypes: [...new Set(cards.map(card => card.metadata.cardType))].sort() };
}
