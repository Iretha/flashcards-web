import { canEditDeck, editAccess, permissions } from './permissions';
import { deckLanguages, validateCardLanguages, validateLanguageChange } from './deck-languages';
import { validateMetadata } from '../lib/metadata';
import { MAX_MARKDOWN_BYTES, MARKDOWN_SIZE_ERROR } from '../lib/import-limits';
import type { CardMetadata } from '../lib/metadata';
import { parseMarkdown, questionKey } from '../lib/markdown';
import type { ImportCard } from '../lib/markdown';
import { isLanguage, sections } from '../lib/translations';
import type { Translations } from '../lib/translations';
import { planImport, uniqueQuestions } from './import-plan';
import type { ImportTarget } from './import-plan';
import { check, HttpError, object, string } from './http';

export interface Deck {
  primaryLanguage: string | null; supportedLanguages: string[];
  id: string; owner_id: string; source_key: string | null; title: string; description: string;
  chatgpt_default: string; chatgpt_en: string | null; chatgpt_bg: string | null;
  visibility: 'PRIVATE' | 'SHARED'; revision: number;
}
export interface Card extends ImportCard, ImportTarget {
  deck_id: string; position: number; status: 'LEARNED' | 'UNLEARNED';
  times_shown: number; times_failed: number; times_learned: number;
  last_shown_at: number | null; last_learned_at: number | null;
  simple_opens: number; example_opens: number; details_opens: number;
}

export async function getDeck(db: D1Database, user: string, id: string, write = false) {
  const deck = await db.prepare('SELECT * FROM decks WHERE id = ?').bind(id).first<Deck>();
  check(deck && (await canEditDeck(db, user, deck) || (!write && deck.visibility === 'SHARED')), 'Deck not available.', 404);
  return decodeDeck(deck);
}

export async function listDecks(db: D1Database, user: string) {
  return (await db.prepare(`SELECT d.*, d.owner_id = ? AS owned,
    (d.owner_id = ?1 OR EXISTS(SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?1)) AS editable,
    (SELECT username FROM users WHERE id = d.owner_id) AS owner_username, count(c.id) AS total,
    sum(CASE WHEN p.status = 'LEARNED' THEN 1 ELSE 0 END) AS learned,
    coalesce(sum(p.times_shown), 0) AS presentations, coalesce(sum(p.times_failed), 0) AS failures
    FROM decks d LEFT JOIN cards c ON c.deck_id = d.id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE d.owner_id = ? OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?3) GROUP BY d.id ORDER BY d.title, d.id`)
    .bind(user, user, user).all<Deck & { owned: number; total: number; learned: number; presentations: number; failures: number; editable: number; owner_username: string }>()).results.map(deck => ({ ...decodeDeck(deck), permissions: permissions(Boolean(deck.owned), Boolean(deck.editable)) }));
}

export async function listCards(db: D1Database, user: string, deck: string) {
  return (await cardsForDeck(db, user, deck).all<CardRow>()).results.map(decodeCard);
}

export function decodeDeck<T extends Deck>(deck: T): T {
  return { ...deck, supportedLanguages: typeof deck.supportedLanguages === 'string' ? JSON.parse(deck.supportedLanguages) : deck.supportedLanguages };
}

type CardRow = Omit<Card, 'translations' | 'metadata'> & { translations: string; metadata: string | null };

function decodeCard(card: CardRow): Card {
  return { ...card, translations: JSON.parse(card.translations) as Translations, metadata: card.metadata ? JSON.parse(card.metadata) as CardMetadata : null };
}

export async function deckWithCards(db: D1Database, user: string, id: string, cardId?: string) {
  const [parent, cards] = await db.batch([
    db.prepare("SELECT * FROM decks WHERE id = ? AND (owner_id = ? OR visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = decks.id AND dc.user_id = ?2))").bind(id, user),
    cardsForDeck(db, user, id, cardId),
  ]);
  const deck = parent.results[0] as unknown as Deck | undefined;
  check(deck, 'Deck not available.', 404);
  return { deck: decodeDeck(deck), cards: (cards.results as unknown as CardRow[]).map(decodeCard) };
}

function cardsForDeck(db: D1Database, user: string, deck: string, cardId?: string) {
  const args = cardId ? [user, deck, user, cardId] : [user, deck, user];
  return db.prepare(`SELECT c.*, coalesce(p.status, 'UNLEARNED') AS status,
    coalesce(p.times_shown, 0) AS times_shown, coalesce(p.times_failed, 0) AS times_failed,
    coalesce(p.times_learned, 0) AS times_learned, p.last_shown_at, p.last_learned_at,
    coalesce(p.simple_opens, 0) AS simple_opens, coalesce(p.example_opens, 0) AS example_opens,
    coalesce(p.details_opens, 0) AS details_opens
    FROM cards c JOIN decks d ON d.id = c.deck_id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE c.deck_id = ? AND (d.owner_id = ? OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?3))
      ${cardId ? 'AND c.id = ?' : ''} ORDER BY c.position, c.id`).bind(...args);
}

function readTranslations(input: unknown): Translations {
  const fields = object(input);
  check(Object.keys(fields).every(isLanguage), 'Use canonical BCP 47 language codes.');
  const translations: Translations = {};
  for (const language of Object.keys(fields)) {
    const entry = object(fields[language]);
    function markdown(field: string, max: number, optional = false) {
      const value = entry[field] ?? '';
      check(typeof value === 'string', 'Invalid ' + field + '.');
      return string(value, field, max, optional) ? value : '';
    }
    const translation = { question: markdown('question', 2000), answer: markdown('answer', 20000) };
    const extras = Object.fromEntries((['questionDetails', ...sections] as const).flatMap(section => {
      const value = markdown(section, 20000, true);
      return value ? [[section, value]] : [];
    }));
    translations[language] = { ...translation, ...extras };
  }
  return translations;
}

function visibility(value: unknown) {
  check(value === 'PRIVATE' || value === 'SHARED', 'Choose a visibility.');
  return value;
}

export async function saveDeck(db: D1Database, user: string, input: Record<string, unknown>) {
  const title = string(input.title, 'title', 160);
  const description = string(input.description ?? '', 'description', 2000, true);
  const scope = visibility(input.visibility);
  const overrides: (string | null)[] = [];
  for (const key of ['chatgpt_en', 'chatgpt_bg']) {
    const value = input[key];
    check(value === undefined || value === null || (typeof value === 'string' && value.trim().length > 0 && value.length <= 10000), 'Invalid ChatGPT instructions (1?10000 characters).');
    overrides.push(typeof value === 'string' ? value : null);
  }
  const existingDeck = input.id ? await getDeck(db, user, String(input.id), true) : null;
  if (existingDeck) check(existingDeck.owner_id === user || scope === existingDeck.visibility, 'Only the owner may change visibility.', 403);
  const config = deckLanguages(input, existingDeck);
  const { primaryLanguage, supportedLanguages } = config;
  const configCards = existingDeck ? await listCards(db, user, existingDeck.id) : [];
  if (existingDeck) validateLanguageChange(input, existingDeck, config, configCards);
  const mutation = crypto.randomUUID();
  const now = Date.now();
  if (input.id) {
    const id = string(input.id, 'deck ID', 80);
    const header = db.prepare(`UPDATE decks SET primaryLanguage = ?, supportedLanguages = ?, title = ?, description = ?, visibility = ?, updated_at = ?,
      chatgpt_en = CASE WHEN ? THEN ? ELSE chatgpt_en END, chatgpt_bg = CASE WHEN ? THEN ? ELSE chatgpt_bg END, revision = revision + 1, mutation = ? WHERE id = ? AND ${editAccess(13)} AND revision = ?`).bind(primaryLanguage, JSON.stringify(supportedLanguages), title, description, scope, now, 'chatgpt_en' in input, overrides[0], 'chatgpt_bg' in input, overrides[1], mutation, id, user, existingDeck!.revision);
    const [result] = await db.batch([header, ...primaryLanguageStatements(db, id, mutation, primaryLanguage!, existingDeck!.primaryLanguage !== primaryLanguage, configCards)]);
    check(result.meta.changes, 'Deck changed. Reload and retry.', 409);
    return { id };
  }
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO decks(primaryLanguage, supportedLanguages, id, owner_id, title, description, visibility, created_at, updated_at, chatgpt_en, chatgpt_bg)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(primaryLanguage, JSON.stringify(supportedLanguages), id, user, title, description, scope, now, now, ...overrides).run();
  return { id };
}

export async function changeCard(db: D1Database, user: string, deckId: string, input: Record<string, unknown>) {
  const deck = await getDeck(db, user, deckId, true);
  const now = Date.now();
  const id = input.id ? string(input.id, 'card ID', 80) : crypto.randomUUID();
  const method = input.method;
  if (method === 'delete') check((await listCards(db, user, deckId)).some(card => card.id === id), 'Card not available.', 404);
  if (method === 'up' || method === 'down') {
    const cards = await listCards(db, user, deckId);
    const index = cards.findIndex(card => card.id === id);
    check(index >= 0, 'Card not available.', 404);
    if (!cards[index + (method === 'up' ? -1 : 1)]) return {};
  }
  if (method !== 'delete' && method !== 'up' && method !== 'down') {
    check(method === 'save', 'Invalid card operation.');
    const cards = await listCards(db, user, deckId);
    const current = cards.find(card => card.id === id);
    check(!input.id || current, 'Card not available.', 404);
    let translations: Translations;
    if (input.translations !== undefined) {
      translations = { ...current?.translations, ...readTranslations(input.translations) };
    } else {
      const question = string(input.question, 'question', 2000);
      const answer = string(input.answer, 'answer', 20000);
      const language = deck.primaryLanguage ?? current?.primary_language;
      check(language, 'Resolve the deck primary language before adding cards.');
      translations = { ...current?.translations, [language]: { ...current?.translations[language], question, answer } };
    }
    const primary = deck.primaryLanguage ?? current?.primary_language;
    check(Object.keys(translations).every(code => deck.supportedLanguages.includes(code)), 'Unsupported deck language.');
    check(primary && translations[primary], 'Primary language content is required.');
    check(primary, 'Add at least one translation.');
    let cardMetadata = current?.metadata ?? null;
    if (input.metadata !== undefined) {
      try { cardMetadata = validateMetadata(input.metadata); }
      catch (error) { throw new HttpError(400, `Card ${current?.import_key ?? id}: ${error instanceof Error ? error.message : 'invalid metadata'}`); }
    }
    if (cardMetadata?.cardType === 'coding_task') check(Object.values(translations).every(value => value.questionDetails?.trim()), `Card ${current?.import_key ?? id}: questionDetails: coding_task requires a task statement for every language.`);
    const next = { metadata: cardMetadata, id, primary_language: primary, import_key: current?.import_key ?? null, translations,
      interview_priority: current?.interview_priority ?? null, difficulty: current?.difficulty ?? null };
    validateCardLanguages(next, deck);
    check(uniqueQuestions([...cards.filter(card => card.id !== id), next]), 'A matching question already exists.', 409);
    const mutation = crypto.randomUUID();
    const header = db.prepare(`UPDATE decks SET revision = revision + 1, mutation = ?, updated_at = ?
      WHERE id = ? AND ${editAccess(4)} AND revision = ?`).bind(mutation, now, deckId, user, deck.revision);
    const [result] = await db.batch([header, writeCards(db, deckId, mutation, now, [next])]);
    check(result.meta.changes, 'Deck changed. Reload it and try again.', 409);
    return {};
  }
  const mutation = crypto.randomUUID();
  const header = db.prepare(`UPDATE decks SET revision = revision + 1, mutation = ?, updated_at = ? WHERE id = ?
    AND ${editAccess(4)} AND revision = ?`).bind(mutation, now, deckId, user, deck.revision);
  // Gate card deletion and reordering on the authorized revision update in this batch.
  const guard = ' AND EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)';
  let guarded: D1PreparedStatement;
  if (method === 'delete') guarded = db.prepare('DELETE FROM cards WHERE id = ? AND deck_id = ?' + guard).bind(id, deckId, deckId, mutation);
  else {
    const cards = await listCards(db, user, deckId);
    const index = cards.findIndex(card => card.id === id);
    const adjacent = cards[index + (method === 'up' ? -1 : 1)];
    guarded = db.prepare(`UPDATE cards SET position = CASE WHEN id = ? THEN ? ELSE ? END, updated_at = ? WHERE deck_id = ? AND id IN (?, ?)` + guard)
      .bind(id, adjacent.position, cards[index].position, now, deckId, id, adjacent.id, deckId, mutation);
  }
  const [result] = await db.batch([header, guarded]);
  check(result.meta.changes, 'Card not available.', 404);
  return {};
}

async function prepareImport(db: D1Database, user: string, input: Record<string, unknown>) {
  check(typeof input.source !== 'string' || new TextEncoder().encode(input.source).byteLength <= MAX_MARKDOWN_BYTES, MARKDOWN_SIZE_ERROR);
  const source = string(input.source, 'Markdown file', MAX_MARKDOWN_BYTES);
  let parsed: ReturnType<typeof parseMarkdown>;
  try { parsed = parseMarkdown(source); }
  catch (error) { throw new HttpError(400, error instanceof Error ? error.message : 'Invalid Markdown frontmatter.'); }
  check(parsed.cards.length > 0 && parsed.cards.length <= 1000, 'Include between 1 and 1000 Markdown questions.');
  const { metadata } = parsed;
  const key = metadata.deckId ? string(metadata.deckId, 'Markdown deckId', 160) : null;
  const deck = input.target === 'new' ? null : input.target
    ? await getDeck(db, user, string(input.target, 'target deck', 80), true)
    : key ? await db.prepare('SELECT * FROM decks WHERE owner_id = ? AND source_key = ?').bind(user, key).first<Deck>() : null;
  if (deck) Object.assign(deck, decodeDeck(deck));
  const existing = deck ? await listCards(db, user, deck.id) : [];
  if (parsed.version === 3 && existing.some(card => !card.metadata) && input.replace !== true) check(false, 'Target contains legacy cards. Use a new deck or separately approved v3 replacement; legacy cards are not migrated.');
  const links = object(input.links ?? {});
  if (input.replace === true) {
    check(deck && deck.owner_id === user, 'Only the owner may replace cards.', 403);
  }
  return { deck, key, metadata, existing, parsed, links };
}

export async function inspectImport(db: D1Database, user: string, input: Record<string, unknown>) {
  const { deck, key, metadata, existing, parsed, links } = await prepareImport(db, user, input);
  const { rows } = planImport(parsed, input.replace === true ? [] : existing, links, {});
  const impact = deck ? await replacementImpact(db, deck.id) : null;
  return { impact, deck, key, metadata, rows, existing: existing.length, version: parsed.version };
}

export function writeCards(db: D1Database, deck: string, mutation: string, now: number, cards: ImportTarget[], insertOnly = false) {
  const values = cards.map((card, position) => {
    const content = card.translations[card.primary_language]!;
    return { ...card, ...content, position, questionKey: questionKey(content.question) };
  });
  return db.prepare(`INSERT INTO cards (id, deck_id, stable_key, question_key, question, answer, position,
    created_at, updated_at, import_key, primary_language, translations, interview_priority, difficulty, metadata)
    SELECT value ->> 'id', ?, value ->> 'id', value ->> 'questionKey', value ->> 'question', value ->> 'answer',
      (SELECT coalesce(max(position), -1) + 1 FROM cards WHERE deck_id = ?) + (value ->> 'position'),
      ?, ?, value ->> 'import_key', value ->> 'primary_language', value -> 'translations',
      value ->> 'interview_priority', value ->> 'difficulty', CASE WHEN json_type(value, '$.metadata') = 'object' THEN value -> 'metadata' ELSE NULL END
    FROM json_each(?) WHERE EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)
    ${insertOnly ? '' : `ON CONFLICT(id) DO UPDATE SET question_key = excluded.question_key, question = excluded.question,
      answer = excluded.answer, updated_at = excluded.updated_at, import_key = excluded.import_key,
      primary_language = excluded.primary_language, translations = excluded.translations,
      interview_priority = excluded.interview_priority, difficulty = excluded.difficulty, metadata = excluded.metadata`}`)
    .bind(deck, deck, now, now, JSON.stringify(values), deck, mutation);
}

export async function applyImport(db: D1Database, user: string, input: Record<string, unknown>) {
  const { deck, key, metadata, parsed, existing, links } = await prepareImport(db, user, input);
  check(input.previewId === (deck?.id ?? null) && input.revision === (deck?.revision ?? null), 'Deck changed. Preview the import again.', 409);
  const updates = object(input.choices ?? {});
  const scope = visibility(input.visibility ?? metadata.visibility?.toUpperCase() ?? deck?.visibility ?? 'PRIVATE');
  if (deck) check(deck.owner_id === user || scope === deck.visibility, 'Only the owner may change visibility.', 403);
  const title = string(input.title ?? deck?.title ?? (metadata.title || input.filename), 'title', 160);
  const description = string(input.description ?? deck?.description ?? metadata.description ?? '', 'description', 2000, true);
  if (input.replace === true) check(input.confirmReplacement === deck?.id, 'Confirm replacement with the exact target deck ID.');
  const { rows, changed, cards } = planImport(parsed, input.replace === true ? [] : existing, links, updates);
  for (const row of rows) {
    if (parsed.version === 3 || input.replace === true) check(row.kind !== 'invalid', row.message ?? 'Invalid v3 card.');
    check(row.kind !== 'link', 'Resolve how each card matches the existing deck.');
    if (row.kind === 'conflict') check(['keep', 'update'].includes(String(updates[row.index])), 'Resolve every content conflict.');
  }
  const declaredPrimary = input.primaryLanguage ?? metadata.primaryLanguage;
  const declaredSupported = input.supportedLanguages ?? (metadata.supportedLanguages ? JSON.parse(metadata.supportedLanguages) : undefined);
  const inferredLanguages = [...new Set(cards.flatMap(card => Object.keys(card.translations)))].sort();
  const inferredPrimary = inferredLanguages.length === 1 ? inferredLanguages[0] : null;
  const languageConfig = deck ? { primaryLanguage: deck.primaryLanguage, supportedLanguages: deck.supportedLanguages }
    : declaredPrimary !== undefined || declaredSupported !== undefined
      ? deckLanguages({ primaryLanguage: declaredPrimary ?? inferredPrimary, supportedLanguages: declaredSupported ?? inferredLanguages })
      : deckLanguages({ primaryLanguage: inferredPrimary, supportedLanguages: inferredLanguages });
  for (const card of cards) validateCardLanguages(card, languageConfig);
  if (languageConfig.primaryLanguage) for (const card of changed) card.primary_language = languageConfig.primaryLanguage;
  check(uniqueQuestions(cards), 'A matching question already exists.', 409);
  check(rows.some(row => row.kind !== 'invalid'), 'There are no valid cards to import.');
  if (deck && !changed.length && deck.visibility === scope && deck.title === title && deck.description === description) return { id: deck.id, imported: 0, updatedTranslations: 0 };
  const id = deck?.id ?? crypto.randomUUID();
  const mutation = crypto.randomUUID();
  const now = Date.now();
  const header = deck
    ? db.prepare(`UPDATE decks SET title = ?, description = ?, visibility = ?, revision = revision + 1, mutation = ?, updated_at = ?
      WHERE id = ? AND ${editAccess(7)} AND revision = ?`).bind(title, description, scope, mutation, now, id, user, deck.revision)
    : db.prepare(`INSERT INTO decks(primaryLanguage, supportedLanguages, id, owner_id, source_key, title, description, visibility, mutation, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(languageConfig.primaryLanguage, JSON.stringify(languageConfig.supportedLanguages), id, user, key, title, description, scope, mutation, now, now);
  const batch = [header];
  if (input.replace === true) {
    // All changes share the revision-checked mutation and one atomic D1 batch.
    // card_deleted invalidates sessions; progress cascades, historical events remain.
    batch.push(db.prepare('DELETE FROM cards WHERE deck_id = ? AND EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)').bind(id, id, mutation));
  }
  batch.push(writeCards(db, id, mutation, now, changed));
  const [result] = await db.batch(batch);
  check(result.meta.changes, 'Deck changed. Preview the import again.', 409);
  return { id, imported: changed.length, updatedTranslations: rows.filter(row => row.kind === 'conflict' && updates[row.index] === 'update').length };
}

export async function replacementImpact(db: D1Database, deck: string) {
  return db.prepare(`SELECT
    (SELECT count(*) FROM cards WHERE deck_id = ?) AS cards,
    (SELECT count(*) FROM card_progress WHERE card_id IN (SELECT id FROM cards WHERE deck_id = ?)) AS progressRecords,
    (SELECT count(*) FROM study_sessions WHERE status = 'ACTIVE' AND ? IN (SELECT value FROM json_each(selected_deck_ids))) AS activeSessions,
    (SELECT count(*) FROM study_events WHERE deck_id = ?) AS retainedHistoricalEvents`)
    .bind(deck, deck, deck, deck).first<{ cards: number; progressRecords: number; activeSessions: number; retainedHistoricalEvents: number }>();
}

export function primaryLanguageStatements(db: D1Database, id: string, mutation: string, language: string, changed: boolean, cards: Card[]) {
  return changed ? cards.map(card => {
    const content = card.translations[language];
    return db.prepare(`UPDATE cards SET primary_language = ?, question = ?, answer = ?, question_key = ?
      WHERE id = ? AND deck_id = ? AND EXISTS (SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
      .bind(language, content.question, content.answer, questionKey(content.question), card.id, id, id, mutation);
  }) : [];
}
