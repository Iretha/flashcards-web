import type { CardMetadata } from '../lib/metadata';
import { advance, defaults, startStudy } from '../lib/study';
import type { Settings, StudyAction, StudyState } from '../lib/study';
import type { User } from './auth';
import { check, object, string } from './http';
import { isLanguage, isSection, selectExplanation, selectTranslation } from '../lib/translations';
import type { Language, Section, Translations } from '../lib/translations';

interface SessionRow {
  id: string; user_id: string; version: number; status: 'ACTIVE' | 'COMPLETE' | 'INVALIDATED';
  selected_deck_ids: string; ordering_mode: Settings['order']; timer_enabled: number;
  timer_seconds: number; session_state: string;
}
const actions = ['show', 'learn', 'repeat', 'next', 'previous', 'forward', 'timeout', 'pause', 'resume', 'language', 'explanation'];

function settings(input: Record<string, unknown>): Settings {
  check(input.order === 'SEQUENTIAL' || input.order === 'RANDOM', 'Choose an ordering mode.');
  check(typeof input.timer === 'boolean', 'Invalid study settings.');
  const seconds = input.seconds;
  check(typeof seconds === 'number' && Number.isInteger(seconds) && seconds >= 1 && seconds <= 3600, 'Timer must be between 1 and 3600 seconds.');
  const language = input.language ?? defaults.language;
  check(isLanguage(language), 'Choose BG or EN.');
  check(input.answersOpen === undefined || typeof input.answersOpen === 'boolean', 'Invalid answer visibility setting.');
  return { order: input.order, timer: input.timer, seconds, onlyUnlearned: false, language, answersOpen: input.answersOpen ?? false };
}

const read = (db: D1Database, user: string) =>
  db.prepare('SELECT * FROM study_sessions WHERE user_id = ?').bind(user).first<SessionRow>();

async function studyCard(db: D1Database, user: string, id: string) {
  const card = await db.prepare(`SELECT c.id, c.question, c.answer, c.translations, c.metadata, d.title FROM cards c JOIN decks d ON d.id = c.deck_id
    WHERE c.id = ? AND (d.owner_id = ? OR d.visibility = 'SHARED')`).bind(id, user)
    .first<{ id: string; question: string; answer: string; title: string; metadata: string | null; translations: string }>();
  return card && { ...card, metadata: card.metadata ? JSON.parse(card.metadata) as CardMetadata : null, translations: JSON.parse(card.translations) as Translations };
}

export async function studyView(db: D1Database, user: string) {
  const row = await read(db, user);
  if (!row) return null;
  const deckIds: string[] = JSON.parse(row.selected_deck_ids);
  const state: StudyState = JSON.parse(row.session_state);
  const language = state.language ?? defaults.language;
  const status = row.status === 'ACTIVE' && !state.cycles ? 'INVALIDATED' as const : row.status;
  if (status !== 'ACTIVE') return { id: row.id, version: row.version, status, card: null, remaining: 0, historical: false, hasPrevious: false, revealed: false, deadline: null, paused: false, seconds: row.timer_seconds, deckIds, language, repeat: false, explanation: null };
  const historical = state.cursor < state.history.length - 1;
  const id = state.history[state.cursor];
  const card = await studyCard(db, user, id);
  return {
    id: row.id, version: row.version, status: card ? row.status : 'INVALIDATED' as const, card,
    repeat: state.cycles?.repeat.includes(id) ?? false,
    remaining: state.cycles ? state.cycles.pending.length + (state.current ? 1 : 0) : state.queue.length, historical, hasPrevious: state.cursor > 0,
    revealed: historical ? Boolean(state.historyRevealed) : state.revealed,
    deadline: state.deadline, paused: state.remainingMs !== null, seconds: row.timer_seconds, deckIds,
    language, explanation: state.explanation ?? null,
  };
}

function event(db: D1Database, user: string, mutation: string, card: string, kind: string, now: number) {
  return db.prepare(`INSERT INTO study_events
    SELECT ?, ?, s.id, c.id, c.deck_id, ?, ? FROM cards c JOIN study_sessions s ON s.user_id = ?
    WHERE c.id = ? AND s.mutation = ?`).bind(crypto.randomUUID(), user, kind, now, user, card, mutation);
}

export async function startSession(db: D1Database, user: User, input: Record<string, unknown>) {
  check(Array.isArray(input.decks) && input.decks.length > 0 && input.decks.length <= 30, 'Select 1 to 30 decks.');
  const deckIds = [...new Set(input.decks.map(id => string(id, 'deck ID', 80)))];
  const config = { ...settings(object(input.settings)), onlyUnlearned: false };
  const prior = await read(db, user.id);
  check((prior?.version ?? 0) === input.version, 'The session changed on another device.', 409);
  const serialized = JSON.stringify(deckIds);
  const snapshot = await db.prepare(`SELECT id, revision FROM decks WHERE (owner_id = ? OR visibility = 'SHARED')
    AND id IN (SELECT value FROM json_each(?))`).bind(user.id, serialized).all<{ id: string; revision: number }>();
  check(snapshot.results.length === deckIds.length, 'One or more decks are unavailable.', 404);
  const cards = (await db.prepare(`SELECT c.id, coalesce(p.status, 'UNLEARNED') AS status,
    coalesce(p.times_failed, 0) AS times_failed FROM json_each(?) selection
    JOIN cards c ON c.deck_id = selection.value JOIN decks d ON d.id = c.deck_id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE (d.owner_id = ? OR d.visibility = 'SHARED')
    ORDER BY selection.key, c.position, c.id LIMIT 5001`)
    .bind(serialized, user.id, user.id).all<{ id: string; status: string; times_failed: number }>()).results;
  const eligible = cards;
  check(eligible.length <= 5000, 'Select at most 5000 cards in one study session.');
  const now = Date.now();
  const state = startStudy(eligible.map(card => ({ id: card.id, visits: 0, failed: card.times_failed })), config, now);
  const mutation = crypto.randomUUID();
  const id = crypto.randomUUID();
  const status = state.current ? 'ACTIVE' : 'COMPLETE';
  const statement = db.prepare(`INSERT INTO study_sessions
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (
      SELECT 1 FROM json_each(?) snap LEFT JOIN decks d ON d.id = snap.value ->> 'id'
      WHERE d.id IS NULL OR d.revision <> (snap.value ->> 'revision')
    ) AND (? = 0 OR EXISTS (SELECT 1 FROM study_sessions WHERE user_id = ? AND version = ?))
    ON CONFLICT(user_id) DO UPDATE SET id = excluded.id, selected_deck_ids = excluded.selected_deck_ids,
      ordering_mode = excluded.ordering_mode, timer_enabled = excluded.timer_enabled, timer_seconds = excluded.timer_seconds,
      current_card_id = excluded.current_card_id, session_state = excluded.session_state, status = excluded.status,
      version = excluded.version, mutation = excluded.mutation, created_at = excluded.created_at, updated_at = excluded.updated_at
    WHERE study_sessions.version = ?`)
    .bind(id, user.id, serialized, config.order, Number(config.timer), config.seconds, state.current,
      JSON.stringify(state), status, (prior?.version ?? 0) + 1, mutation, now, now, JSON.stringify(snapshot.results),
      prior?.version ?? 0, user.id, prior?.version ?? 0, prior?.version ?? 0);
  const batch = [
    statement,
    db.prepare(`UPDATE users SET settings = ? WHERE id = ? AND EXISTS
      (SELECT 1 FROM study_sessions WHERE user_id = ? AND mutation = ?)`).bind(JSON.stringify(config), user.id, user.id, mutation),
  ];
  if (state.current) batch.push(event(db, user.id, mutation, state.current, 'SHOWN', now));
  const [result] = await db.batch(batch);
  check(result.meta.changes, 'The deck or session changed. Reload and try again.', 409);
  return studyView(db, user.id);
}

export async function act(db: D1Database, user: User, input: Record<string, unknown>) {
  const action = string(input.action, 'action', 20) as StudyAction;
  check(actions.includes(action), 'Invalid study action.');
  const row = await read(db, user.id);
  check(row?.status === 'ACTIVE' && row.id === input.id && row.version === input.version, 'The session changed on another device.', 409);
  const previous: StudyState = JSON.parse(row.session_state);
  check(previous.cycles, 'This pre-v3 session must be restarted.', 409);
  const now = Date.now();
  const { state, outcome, shown } = advance(previous, {
    ...defaults, order: row.ordering_mode, timer: Boolean(row.timer_enabled), seconds: row.timer_seconds,
  }, action, now);
  let opened: { id: string; section: Section } | undefined;
  let language: Language | undefined;
  if (action === 'language') {
    check(isLanguage(input.language), 'Choose BG or EN.');
    if (input.language !== (previous.language ?? defaults.language)) {
      language = input.language;
      state.language = language;
    }
  }
  if (action === 'explanation') {
    const section = input.section;
    check(isSection(section), 'Choose an explanation.');
    const historical = previous.cursor < previous.history.length - 1;
    check(historical ? previous.historyRevealed : previous.revealed, 'Show the answer first.', 409);
    const id = previous.history[previous.cursor];
    const card = await studyCard(db, user.id, id);
    check(card, 'Card not available.', 404);
    const selected = selectTranslation(card.translations, state.language ?? defaults.language);
    check(selectExplanation(card.translations, selected.language, section).content, 'Explanation not available.', 404);
    state.explanation = state.explanation === section ? null : section;
    if (state.explanation) opened = { id, section };
  }
  const encoded = JSON.stringify(state);
  if (encoded === row.session_state) return studyView(db, user.id);
  const mutation = crypto.randomUUID();
  const batch = [db.prepare(`UPDATE study_sessions SET session_state = ?, current_card_id = ?, status = ?,
    version = version + 1, mutation = ?, updated_at = ? WHERE user_id = ? AND id = ? AND version = ? AND status = 'ACTIVE'`)
    .bind(encoded, state.current, state.current ? 'ACTIVE' : 'COMPLETE', mutation, now, user.id, row.id, row.version)];
  if (previous.current && outcome && outcome !== 'NEXT') batch.push(event(db, user.id, mutation, previous.current, outcome, now));
  if (shown) batch.push(event(db, user.id, mutation, shown, 'SHOWN', now));
  if (language) batch.push(db.prepare(`UPDATE users SET settings = json_set(settings, '$.language', ?)
    WHERE id = ? AND EXISTS (SELECT 1 FROM study_sessions WHERE user_id = ? AND mutation = ?)`)
    .bind(language, user.id, user.id, mutation));
  if (opened) {
    const column = { simple: 'simple_opens', example: 'example_opens', details: 'details_opens' }[opened.section];
    batch.push(db.prepare(`INSERT INTO card_progress(user_id, card_id, ${column})
      SELECT ?, c.id, 1 FROM cards c JOIN study_sessions s ON s.user_id = ?
      WHERE c.id = ? AND s.mutation = ?
      ON CONFLICT(user_id, card_id) DO UPDATE SET ${column} = ${column} + 1`)
      .bind(user.id, user.id, opened.id, mutation));
  }
  const [result] = await db.batch(batch);
  check(result.meta.changes, 'The session changed on another device.', 409);
  return studyView(db, user.id);
}

export async function reset(db: D1Database, user: string, deck: string, card: string | null) {
  const now = Date.now();
  const accessible = `EXISTS(SELECT 1 FROM decks WHERE id = ? AND (owner_id = ? OR visibility = 'SHARED'))`;
  const target = `card_id IN (SELECT id FROM cards WHERE deck_id = ? AND (? IS NULL OR id = ?))`;
  await db.batch([
    db.prepare(`INSERT INTO study_events SELECT lower(hex(randomblob(16))), user_id, NULL, card_id, ?, 'RESET', ?
      FROM card_progress WHERE user_id = ? AND status = 'LEARNED' AND ${target} AND ${accessible}`)
      .bind(deck, now, user, deck, card, card, deck, user),
    db.prepare(`UPDATE card_progress SET status = 'UNLEARNED' WHERE user_id = ? AND ${target} AND ${accessible}`)
      .bind(user, deck, card, card, deck, user),
    db.prepare(`UPDATE study_sessions SET version = version + 1, mutation = NULL, updated_at = ?,
      status = CASE WHEN status = 'ACTIVE' AND ? IN (SELECT value FROM json_each(selected_deck_ids))
        THEN 'INVALIDATED' ELSE status END WHERE user_id = ? AND ${accessible}`)
      .bind(now, deck, user, deck, user),
  ]);
  return {};
}
