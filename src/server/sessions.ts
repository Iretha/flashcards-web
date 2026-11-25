import { projectStudy, projectionOptions } from '../lib/study-projection';
import type { ProjectionCard } from '../lib/study-projection';
import { matchesClassification } from '../lib/classification';
import { advance, defaults, startStudy, normalizeStudyState } from '../lib/study';
import type { Settings, StudyAction } from '../lib/study';
import type { User } from './auth';
import { check, object, string } from './http';
import { isLanguage, languageUnion, reconcileLanguage, completeTranslation } from '../lib/translations';
import type { Language, Translations } from '../lib/translations';
import { legacyMetadataProjection } from './decks';
import type { CanonicalCardMetadata } from '../lib/metadata';

interface SessionRow {
  id: string; user_id: string; version: number; status: 'ACTIVE' | 'COMPLETE' | 'INVALIDATED';
  selected_deck_ids: string; ordering_mode: Settings['order']; timer_enabled: number;
  timer_seconds: number; session_state: string;
}
const actions = ['show', 'learn', 'repeat', 'next', 'previous', 'forward', 'timeout', 'pause', 'resume', 'language'];

function settings(input: Record<string, unknown>): Settings {
  check(input.order === 'SEQUENTIAL' || input.order === 'RANDOM', 'Choose an ordering mode.');
  check(typeof input.timer === 'boolean', 'Invalid study settings.');
  const seconds = input.seconds;
  check(typeof seconds === 'number' && Number.isInteger(seconds) && seconds >= 1 && seconds <= 3600, 'Timer must be between 1 and 3600 seconds.');
  const language = input.language ?? defaults.language;
  check(isLanguage(language), 'Use a canonical BCP 47 language code.');
  check(input.answersOpen === undefined || typeof input.answersOpen === 'boolean', 'Invalid answer visibility setting.');
  return { order: input.order, timer: input.timer, seconds, onlyUnlearned: false, language, answersOpen: input.answersOpen ?? false };
}

const read = (db: D1Database, user: string) =>
  db.prepare('SELECT * FROM study_sessions WHERE user_id = ?').bind(user).first<SessionRow>();

// Guard both content and the complete selected-deck access scope in the same CAS.
// The existing search epoch already covers card/topic writes; no second index/signal.
const sourceSql = `SELECT json_object('epoch', (SELECT epoch FROM card_search_state WHERE id=1),
  'decks', json_group_array(json_object('id', selection.value, 'revision', d.revision)))
  FROM json_each(?) selection LEFT JOIN decks d ON d.id=selection.value AND
  (d.owner_id=? OR d.visibility='SHARED' OR EXISTS
    (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id=d.id AND dc.user_id=?))`;
const sourceBindings = (row: Pick<SessionRow, 'selected_deck_ids' | 'user_id'>) => [row.selected_deck_ids, row.user_id, row.user_id];
const sourceToken = async (db: D1Database, row: Pick<SessionRow, 'selected_deck_ids' | 'user_id'>) => (await db.prepare(`SELECT (${sourceSql}) AS token`).bind(...sourceBindings(row)).first<{ token: string }>())!.token;
const sessionSettings = (row: SessionRow): Settings => ({ ...defaults, order: row.ordering_mode,
  timer: Boolean(row.timer_enabled), seconds: row.timer_seconds });

async function liveScope(db: D1Database, row: SessionRow) {
  const token = await sourceToken(db, row);
  const rows = await db.prepare(`SELECT c.id, c.priority, c.likelihood, c.creation_mode,
    json_object('cardType', coalesce(c.metadata ->> '$.cardType', 'question')) AS metadata,
    coalesce((SELECT json_group_array(topic_name) FROM
      (SELECT topic_name FROM card_topics WHERE card_id=c.id ORDER BY topic_name)), '[]') topics
    FROM json_each(?) selection JOIN cards c ON c.deck_id=selection.value JOIN decks d ON d.id=c.deck_id
    WHERE d.owner_id=? OR d.visibility='SHARED' OR EXISTS
      (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id=d.id AND dc.user_id=?)
    ORDER BY selection.key, c.position, c.id`).bind(...sourceBindings(row)).all<{
      id: string; priority: ProjectionCard['priority']; likelihood: ProjectionCard['likelihood'];
      creation_mode: ProjectionCard['creationMode']; metadata: string; topics: string;
    }>();
  const cards: ProjectionCard[] = rows.results.map(card => ({ id: card.id, priority: card.priority,
    likelihood: card.likelihood, creationMode: card.creation_mode,
    metadata: JSON.parse(card.metadata) ?? { cardType: 'question' }, topics: JSON.parse(card.topics) }));
  return { token, cards };
}

async function reconcileRead(db: D1Database, user: string) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const row = await read(db, user);
    if (!row) return null;
    const scope = await liveScope(db, row);
    const original = normalizeStudyState(JSON.parse(row.session_state));
    const state = row.status === 'ACTIVE' ? projectStudy(original, scope.cards, sessionSettings(row), Date.now()) : original;
    const encoded = JSON.stringify(state);
    if (encoded === row.session_state) {
      const token = await sourceToken(db, row);
      if (token === scope.token) return { row, state, cards: scope.cards, token: scope.token };
      continue;
    }
    const mutation = crypto.randomUUID();
    const now = Date.now();
    const batch = [db.prepare(`UPDATE study_sessions SET session_state=?, current_card_id=?,
      version=version+1, mutation=?, updated_at=? WHERE user_id=? AND id=? AND version=?
      AND (${sourceSql})=?`).bind(encoded, state.current, mutation, now, user, row.id, row.version,
        ...sourceBindings(row), scope.token)];
    const frontier = state.cycles?.live?.frontier;
    if (row.status === 'ACTIVE' && frontier && frontier !== original.cycles?.live?.frontier &&
        frontier !== original.cycles?.history.at(-1)) batch.push(event(db, user, mutation, frontier, 'SHOWN', now));
    const [result] = await db.batch(batch);
    if (result.meta.changes) return { row: { ...row, session_state: encoded, version: row.version + 1 }, state, cards: scope.cards, token: scope.token };
  }
  check(false, 'The deck or session changed. Reload and try again.', 409);
}

async function studyCard(db: D1Database, user: string, id: string) {
  const card = await db.prepare(`SELECT c.deck_id, c.id, c.translations, c.metadata, c.primary_language,
    coalesce((SELECT json_group_array(topic_name) FROM (SELECT topic_name FROM card_topics WHERE card_id=c.id ORDER BY topic_name)), '[]') AS topics,
    d.primaryLanguage, d.supportedLanguages, d.title FROM cards c JOIN decks d ON d.id = c.deck_id
    WHERE c.id = ? AND (d.owner_id = ? OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?2))`).bind(id, user)
    .first<{ deck_id: string; id: string; title: string; primary_language: string; primaryLanguage: string | null; supportedLanguages: string; metadata: string | null; topics: string; translations: string }>();
  const decoded = card && { ...card, primaryLanguage: card.primaryLanguage ?? card.primary_language, supportedLanguages: JSON.parse(card.supportedLanguages) as string[], metadata: legacyMetadataProjection(card.metadata ? JSON.parse(card.metadata) as CanonicalCardMetadata : null, JSON.parse(card.topics) as string[]), translations: JSON.parse(card.translations) as Translations };
  return decoded && completeTranslation(decoded.translations[decoded.primaryLanguage], decoded.metadata?.cardType) ? decoded : null;
}

export async function studyView(db: D1Database, user: string) {
  const reconciled = await reconcileRead(db, user);
  if (!reconciled) return null;
  const { row, state, cards, token } = reconciled;
  const projection = { applied: state.classification, availableOptions: projectionOptions(cards),
    eligibleTotal: cards.filter(card => !state.classification || matchesClassification(state.classification.filters, card)).length,
    remainingInCycle: (state.cycles?.pending.length ?? 0) + (state.cycles?.live?.frontier ? 1 : 0) };
  const deckIds: string[] = JSON.parse(row.selected_deck_ids);
  const availableLanguages = await sessionLanguages(db, user, deckIds);
  const language = reconcileLanguage(state.language ?? defaults.language, availableLanguages);
  const status = row.status === 'ACTIVE' && !state.cycles ? 'INVALIDATED' as const : row.status;
  check(await sourceToken(db, row) === token, 'The deck changed. Reload and try again.', 409);
  if (status !== 'ACTIVE') return { ...projection, id: row.id, version: row.version, status, card: null, remaining: 0, historical: false, hasPrevious: false, revealed: false, deadline: null, paused: false, seconds: row.timer_seconds, deckIds, language, availableLanguages, repeat: false };
  const accessibleIds = new Set(cards.map(card => card.id));
  const historical = state.cursor < state.history.length - 1;
  const id = state.history[state.cursor];
  const card = state.current ? await studyCard(db, user, id) : null;
  check(await sourceToken(db, row) === token, 'The deck changed. Reload and try again.', 409);
  return {
    ...projection, id: row.id, version: row.version, status: row.status, card,
    repeat: state.cycles?.repeat.includes(id) ?? false,
    remaining: projection.remainingInCycle, historical,
    hasPrevious: state.history.slice(0, state.cursor).some(id => accessibleIds.has(id)),
    revealed: historical ? Boolean(state.historyRevealed) : state.revealed,
    deadline: state.deadline, paused: state.remainingMs !== null, seconds: row.timer_seconds, deckIds,
    language, availableLanguages,
  };
}

function event(db: D1Database, user: string, mutation: string, card: string, kind: string, now: number) {
  return db.prepare(`INSERT INTO study_events
    SELECT ?, ?, s.id, c.id, c.deck_id, ?, ? FROM cards c JOIN study_sessions s ON s.user_id = ?
    JOIN decks d ON d.id=c.deck_id
    WHERE c.id = ? AND s.mutation = ? AND (d.owner_id=s.user_id OR d.visibility='SHARED' OR EXISTS
      (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id=d.id AND dc.user_id=s.user_id))`).bind(crypto.randomUUID(), user, kind, now, user, card, mutation);
}

export async function startSession(db: D1Database, user: User, input: Record<string, unknown>) {
  check(Array.isArray(input.decks) && input.decks.length > 0 && input.decks.length <= 30, 'Select 1 to 30 decks.');
  const deckIds = [...new Set(input.decks.map(id => string(id, 'deck ID', 80)))];
  const config = { ...settings(object(input.settings)), onlyUnlearned: false };
  const prior = await read(db, user.id);
  check((prior?.version ?? 0) === input.version, 'The session changed on another device.', 409);
  const serialized = JSON.stringify(deckIds);
  const startScope = { selected_deck_ids: serialized, user_id: user.id };
  const startToken = await sourceToken(db, startScope);
  const snapshot = await db.prepare(`SELECT id, revision, supportedLanguages FROM decks WHERE (owner_id = ? OR visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = decks.id AND dc.user_id = ?1))
    AND id IN (SELECT value FROM json_each(?))`).bind(user.id, serialized).all<{ id: string; revision: number; supportedLanguages: string }>();
  check(snapshot.results.length === deckIds.length, 'One or more decks are unavailable.', 404);
  config.language = reconcileLanguage(config.language, languageUnion(snapshot.results.map(deck => ({ supportedLanguages: JSON.parse(deck.supportedLanguages) }))));
  const cards = (await db.prepare(`SELECT c.id, coalesce(p.status, 'UNLEARNED') AS status,
    coalesce(p.times_failed, 0) AS times_failed FROM json_each(?) selection
    JOIN cards c ON c.deck_id = selection.value JOIN decks d ON d.id = c.deck_id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE (d.owner_id = ? OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?3))
    ORDER BY selection.key, c.position, c.id LIMIT 5001`)
    .bind(serialized, user.id, user.id).all<{ id: string; status: string; times_failed: number }>()).results;
  const eligible = cards;
  check(eligible.length <= 5000, 'Select at most 5000 cards in one study session.');
  const now = Date.now();
  const state = startStudy(eligible.map(card => ({ id: card.id })), config, now);
  const mutation = crypto.randomUUID();
  const id = crypto.randomUUID();
  const status = state.current ? 'ACTIVE' : 'COMPLETE';
  const statement = db.prepare(`INSERT INTO study_sessions
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE NOT EXISTS (
      SELECT 1 FROM json_each(?) snap LEFT JOIN decks d ON d.id = snap.value ->> 'id'
      WHERE d.id IS NULL OR d.revision <> (snap.value ->> 'revision')
    ) AND (${sourceSql})=? AND (? = 0 OR EXISTS (SELECT 1 FROM study_sessions WHERE user_id = ? AND version = ?))
    ON CONFLICT(user_id) DO UPDATE SET id = excluded.id, selected_deck_ids = excluded.selected_deck_ids,
      ordering_mode = excluded.ordering_mode, timer_enabled = excluded.timer_enabled, timer_seconds = excluded.timer_seconds,
      current_card_id = excluded.current_card_id, session_state = excluded.session_state, status = excluded.status,
      version = excluded.version, mutation = excluded.mutation, created_at = excluded.created_at, updated_at = excluded.updated_at
    WHERE study_sessions.version = ?`)
    .bind(id, user.id, serialized, config.order, Number(config.timer), config.seconds, state.current,
      JSON.stringify(state), status, (prior?.version ?? 0) + 1, mutation, now, now, JSON.stringify(snapshot.results), ...sourceBindings(startScope), startToken,
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

export async function act(db: D1Database, user: User, input: Record<string, unknown>, attempt = 0): Promise<Awaited<ReturnType<typeof studyView>>> {
  const action = string(input.action, 'action', 20) as StudyAction;
  check(actions.includes(action), 'Invalid study action.');
  const row = await read(db, user.id);
  check(row?.status === 'ACTIVE' && row.id === input.id && row.version === input.version, 'The session changed on another device.', 409);
  const scope = await liveScope(db, row);
  const stored = normalizeStudyState(JSON.parse(row.session_state));
  const previous = projectStudy(stored, scope.cards, sessionSettings(row), Date.now());
  check(previous.cycles, 'This pre-v3 session must be restarted.', 409);
  const now = Date.now();
  const replaced = previous.cycles?.live?.frontier !== stored.cycles?.live?.frontier &&
    previous.cycles?.live?.frontier !== stored.cycles?.history.at(-1);
  const navigation = ['next', 'forward', 'learn'].includes(action);
  const { state, outcome, shown } = advance(previous, {
    ...defaults, order: row.ordering_mode, timer: Boolean(row.timer_enabled), seconds: row.timer_seconds,
  }, replaced && navigation ? 'language' : action, now);
  if (action === 'resume' && input.answersOpen !== undefined) {
    check(typeof input.answersOpen === 'boolean', 'Invalid answer visibility setting.');
    if (input.answersOpen !== (previous.answersOpen ?? false)) {
      state.answersOpen = input.answersOpen;
      state.answerOverrides = {};
      state.revealed = input.answersOpen;
      state.historyRevealed = input.answersOpen;
      if (input.answersOpen) { state.deadline = null; state.remainingMs = null; }
    }
  }
  const available = await sessionLanguages(db, user.id, JSON.parse(row.selected_deck_ids));
  state.language = reconcileLanguage(state.language ?? defaults.language, available);
  let language: Language | undefined = state.language !== previous.language ? state.language : undefined;
  if (action === 'language') {
    check(isLanguage(input.language), 'Use a canonical BCP 47 language code.');
    check(available.includes(input.language), 'Language is not supported by the selected decks.');
    if (input.language !== (previous.language ?? defaults.language)) {
      language = input.language;
      state.language = language;
    }
  }
  const encoded = JSON.stringify(state);
  if (encoded === row.session_state) return studyView(db, user.id);
  const mutation = crypto.randomUUID();
  const batch = [db.prepare(`UPDATE study_sessions SET session_state = ?, current_card_id = ?, status = ?,
    version = version + 1, mutation = ?, updated_at = ? WHERE user_id = ? AND id = ? AND version = ? AND status = 'ACTIVE' AND (${sourceSql})=?`)
    .bind(encoded, state.current, state.cycles?.complete ? 'COMPLETE' : 'ACTIVE', mutation, now, user.id, row.id, row.version, ...sourceBindings(row), scope.token)];
  if (action === 'resume' && typeof input.answersOpen === 'boolean') batch.push(db.prepare(`UPDATE users SET settings = json_set(settings, '$.answersOpen', json(?))
    WHERE id = ? AND EXISTS (SELECT 1 FROM study_sessions WHERE user_id = ? AND mutation = ?)`)
    .bind(JSON.stringify(input.answersOpen), user.id, user.id, mutation));
  if (previous.current && outcome && outcome !== 'NEXT') batch.push(event(db, user.id, mutation, previous.current, outcome, now));
  const presentation = shown ?? (replaced ? previous.cycles?.live?.frontier : null);
  if (presentation) batch.push(event(db, user.id, mutation, presentation, 'SHOWN', now));
  if (language) batch.push(db.prepare(`UPDATE users SET settings = json_set(settings, '$.language', ?)
    WHERE id = ? AND EXISTS (SELECT 1 FROM study_sessions WHERE user_id = ? AND mutation = ?)`)
    .bind(language, user.id, user.id, mutation));
  const [result] = await db.batch(batch);
  if (!result.meta.changes && attempt < 2) return act(db, user, input, attempt + 1);
  check(result.meta.changes, 'The deck or session changed. Reload and try again.', 409);
  return studyView(db, user.id);
}

export async function reset(db: D1Database, user: string, deck: string, card: string | null) {
  const now = Date.now();
  const accessible = (userParameter: number) => `EXISTS(SELECT 1 FROM decks WHERE id = ? AND (owner_id = ? OR visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = decks.id AND dc.user_id = ?${userParameter})))`;
  const target = `card_id IN (SELECT id FROM cards WHERE deck_id = ? AND (? IS NULL OR id = ?))`;
  await db.batch([
    db.prepare(`INSERT INTO study_events SELECT lower(hex(randomblob(16))), user_id, NULL, card_id, ?, 'RESET', ?
      FROM card_progress WHERE user_id = ? AND status = 'LEARNED' AND ${target} AND ${accessible(8)}`)
      .bind(deck, now, user, deck, card, card, deck, user),
    db.prepare(`UPDATE card_progress SET status = 'UNLEARNED' WHERE user_id = ? AND ${target} AND ${accessible(6)}`)
      .bind(user, deck, card, card, deck, user),
    db.prepare(`UPDATE study_sessions SET version = version + 1, mutation = NULL, updated_at = ?,
      status = CASE WHEN status = 'ACTIVE' AND ? IN (SELECT value FROM json_each(selected_deck_ids))
        THEN 'INVALIDATED' ELSE status END WHERE user_id = ? AND ${accessible(5)}`)
      .bind(now, deck, user, deck, user),
  ]);
  return {};
}

async function sessionLanguages(db: D1Database, user: string, ids: string[]) {
  const rows = await db.prepare(`SELECT supportedLanguages FROM decks WHERE id IN (SELECT value FROM json_each(?))
    AND (owner_id = ? OR visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = decks.id AND dc.user_id = ?2))`).bind(JSON.stringify(ids), user).all<{ supportedLanguages: string }>();
  return languageUnion(rows.results.map(row => ({ supportedLanguages: JSON.parse(row.supportedLanguages) })));
}
