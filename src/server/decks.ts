import { editAccess, permissions } from './permissions';
import { deckLanguages, validateCardLanguages, validateLanguageChange } from './deck-languages';
import { validateMetadata, derivedMetadata, metadataForStorage } from '../lib/metadata';
import type { CanonicalCardMetadata } from '../lib/metadata';
import { DEFAULT_CREATION_MODE, DEFAULT_RATING, normalizeTopics, validateCreationMode, validateRating } from '../lib/classification';
import { validateCanonicalMetadata } from '../lib/metadata';
import { validateFinalTranslations } from '../lib/translations';
import type { CreationMode, Rating } from '../lib/classification';
import { MAX_MARKDOWN_BYTES, MARKDOWN_SIZE_ERROR } from '../lib/import-limits';
import type { CardMetadata } from '../lib/metadata';
import { parseMarkdown, questionKey } from '../lib/markdown';
import { isLanguage } from '../lib/translations';
import type { Translations } from '../lib/translations';
import { planImport, uniqueQuestions } from './import-plan';
import type { ImportTarget } from './import-plan';
import type { CanonicalStoredState } from './import-plan';
import { check, HttpError, object, string } from './http';

export interface Deck {
  primaryLanguage: string | null; supportedLanguages: string[];
  id: string; owner_id: string; source_key: string | null; title: string; description: string;
  chatgpt_default: string; chatgpt_en: string | null; chatgpt_bg: string | null;
  editable?: number;
  visibility: 'PRIVATE' | 'SHARED'; revision: number;
  third_party_access?: import('./third-party-access').ThirdPartyAccess;
}
export interface Card extends ImportTarget {
  deck_id: string; position: number; status: 'LEARNED' | 'UNLEARNED';
  times_shown: number; times_failed: number; times_learned: number;
  last_shown_at: number | null; last_learned_at: number | null;
}

export async function getDeck(db: D1Database, user: string, id: string, write = false) {
  const deck = await db.prepare(`SELECT decks.*, ${editAccess(2)} AS editable FROM decks WHERE id = ?1`).bind(id, user).first<Deck>();
  check(deck && (Boolean(deck.editable) || (!write && deck.visibility === 'SHARED')), 'Deck not available.', 404);
  return decodeDeck(deck);
}

export async function listDecks(db: D1Database, user: string, access = 'all') {
  return (await db.prepare(`SELECT d.*, d.owner_id = ? AS owned,
    ${editAccess(1, 'd')} AS editable,
    (SELECT username FROM users WHERE id = d.owner_id) AS owner_username, count(c.id) AS total,
    sum(CASE WHEN p.status = 'LEARNED' THEN 1 ELSE 0 END) AS learned,
    coalesce(sum(p.times_shown), 0) AS presentations, coalesce(sum(p.times_failed), 0) AS failures
    FROM decks d LEFT JOIN cards c ON c.deck_id = d.id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE (?4 = 'all' OR (?4 = 'owned' AND d.owner_id = ?1) OR (?4 = 'shared' AND d.owner_id != ?1) OR (?4 = 'editable' AND ${editAccess(1, 'd')})) AND (d.owner_id = ?3 OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?3)) GROUP BY d.id ORDER BY d.title, d.id`)
    .bind(user, user, user, access).all<Deck & { owned: number; total: number; learned: number; presentations: number; failures: number; editable: number; owner_username: string }>()).results.map(deck => ({ ...decodeDeck(deck), third_party_access: deck.owned ? deck.third_party_access : undefined, permissions: permissions(Boolean(deck.owned), Boolean(deck.editable)) }));
}

export async function listCards(db: D1Database, user: string, deck: string) {
  return (await cardsForDeck(db, user, deck).all<CardRow>()).results.map(decodeCard);
}

export function decodeDeck<T extends Deck>(deck: T): T {
  return { ...deck, supportedLanguages: typeof deck.supportedLanguages === 'string' ? JSON.parse(deck.supportedLanguages) : deck.supportedLanguages };
}

type CardRow = Omit<Card, 'translations' | 'metadata'> & {
  translations: string; metadata: string | null; topics_json?: string;
};

function decodeCard(card: CardRow): Card {
  const { topics_json, priority, likelihood, creation_mode, ...stored } = card as CardRow & {
    priority: Rating; likelihood: Rating; creation_mode: CreationMode;
  };
  const canonical = stored.metadata ? JSON.parse(stored.metadata) as CanonicalCardMetadata : validateCanonicalMetadata({ cardType: 'question' });
  const topics = topics_json ? JSON.parse(topics_json) as string[] : [];
  // Compatibility projection for existing management/Study consumers; v5 imports
  // read canonical state directly and never round-trip through this projection.
  const metadata = legacyMetadataProjection(canonical, topics);
  const result = { ...stored, translations: JSON.parse(stored.translations) as Translations, metadata } as Card;
  Object.defineProperty(result, 'canonical', {
    value: { metadata: canonical, topics, priority, likelihood, creation_mode } satisfies CanonicalStoredState,
    enumerable: false,
  });
  return result;
}

export function legacyMetadataProjection(canonical: CanonicalCardMetadata | null, topics: string[]): CardMetadata | null {
  return canonical?.provenance && topics.length === 1 ? derivedMetadata({
    ...canonical,
    cardType: canonical.cardType === 'task' ? 'coding_task' : 'question',
    topic: topics[0],
  } as CardMetadata) : null;
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
  return db.prepare(`SELECT c.*,
    coalesce((SELECT json_group_array(topic_name) FROM
      (SELECT topic_name FROM card_topics WHERE card_id = c.id ORDER BY topic_name)), '[]') AS topics_json,
    coalesce(p.status, 'UNLEARNED') AS status,
    coalesce(p.times_shown, 0) AS times_shown, coalesce(p.times_failed, 0) AS times_failed,
    coalesce(p.times_learned, 0) AS times_learned, p.last_shown_at, p.last_learned_at
    FROM cards c JOIN decks d ON d.id = c.deck_id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE c.deck_id = ? AND (d.owner_id = ? OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?3))
      ${cardId ? 'AND c.id = ?' : ''} ORDER BY c.position, c.id`).bind(...args);
}

function readTranslations(input: unknown, current: Translations = {}): Translations {
  const fields = object(input);
  check(Object.keys(fields).every(isLanguage), 'Use canonical BCP 47 language codes.');
  const translations: Translations = {};
  for (const language of Object.keys(fields)) {
    const entry = object(fields[language]);
    check(Object.keys(entry).every(key => ['question', 'answer', 'questionDetails'].includes(key)), 'Unsupported translation field.');
    function markdown(field: string, max: number, optional = false) {
      const value = entry[field] ?? '';
      check(typeof value === 'string', 'Invalid ' + field + '.');
      return string(value, field, max, optional) ? value : '';
    }
    const translation = { question: entry.question === undefined && current[language] ? current[language].question : markdown('question', 2000), answer: entry.answer === undefined ? current[language]?.answer ?? '' : markdown('answer', 20000, true) };
    const questionDetails = entry.questionDetails === undefined ? current[language]?.questionDetails : markdown('questionDetails', 20000, true);
    translations[language] = { ...translation, ...(questionDetails === undefined ? {} : { questionDetails }) };
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
  if (existingDeck && existingDeck.owner_id !== user) check(!['chatgpt_default', 'chatgpt_en', 'chatgpt_bg'].some(key => key in input), 'Only the owner may change chat instructions.', 403);
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

export async function changeCard(db: D1Database, user: string, deckId: string, input: Record<string, unknown>, thirdParty = false, idempotency?: { key: string; payload: string }): Promise<{ id?: string; answer?: string; revision?: number; classification?: Record<string, unknown> }> {
  const deck = await getDeck(db, user, deckId, true);
  if (thirdParty) check(deck.third_party_access === 'READ_WRITE', 'Card not available.', 404);
  if (thirdParty && input.expected_revision !== undefined) check(input.expected_revision === deck.revision, 'Deck changed.', 409);
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
    check(method === 'save' || method === 'answer', 'Invalid card operation.');
    const cards = await listCards(db, user, deckId);
    const current = cards.find(card => card.id === id);
    check(!input.id || current, 'Card not available.', 404);
    let translations: Translations;
    if (method === 'answer') {
      check(current, 'Card not available.', 404);
      const language = input.language === undefined ? current.primary_language : string(input.language, 'language', 64);
      check(Object.hasOwn(current.translations, language), 'Translation does not exist.');
      const answer = input.answer === undefined ? current.translations[language].answer : string(input.answer, 'answer', 20000, true);
      translations = { ...current.translations, [language]: { ...current.translations[language], answer } };
    } else if (input.translations !== undefined) {
      translations = { ...current?.translations, ...readTranslations(input.translations, current?.translations) };
    } else {
      const question = string(input.question, 'question', 2000);
      const answer = string(input.answer ?? current?.translations[deck.primaryLanguage ?? current.primary_language]?.answer ?? '', 'answer', 20000, true);
      const language = deck.primaryLanguage ?? current?.primary_language;
      check(language, 'Resolve the deck primary language before adding cards.');
      translations = { ...current?.translations, [language]: { ...current?.translations[language], question, answer, ...(thirdParty && input.questionDetails !== undefined ? { questionDetails: string(input.questionDetails, 'questionDetails', 20000, true) } : {}) } };
    }
    const primary = deck.primaryLanguage ?? current?.primary_language;
    check(Object.keys(translations).every(code => deck.supportedLanguages.includes(code)), 'Unsupported deck language.');
    check(primary && translations[primary], 'Primary language content is required.');
    check(primary, 'Add at least one translation.');
    let cardMetadata = current?.metadata ?? null;
    if (!thirdParty && input.metadata !== undefined) {
      try { cardMetadata = validateMetadata(input.metadata); }
      catch (error) { throw new HttpError(400, `Card ${current?.import_key ?? id}: ${error instanceof Error ? error.message : 'invalid metadata'}`); }
    }
    if (cardMetadata?.cardType === 'coding_task') check(Object.values(translations).every(value => value.questionDetails?.trim()), `Card ${current?.import_key ?? id}: questionDetails: coding_task requires a task statement for every language.`);
    const next = { metadata: cardMetadata, canonical: current?.canonical, id, primary_language: primary, import_key: current?.import_key ?? null, translations,
      interview_priority: current?.interview_priority ?? null, difficulty: current?.difficulty ?? null };
    if (thirdParty) {
      const { cardValues } = await import('./management');
      const patch = Object.fromEntries(['metadata', 'topics', 'priority', 'likelihood', 'creationMode'].filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
      const validated = cardValues({ ...patch, translations, primary_language: primary }, id, current);
      next.canonical = validated.canonical;
    }
    validateCardLanguages({ ...next, metadata: thirdParty ? next.canonical!.metadata : next.metadata }, deck);
    check(uniqueQuestions([...cards.filter(card => card.id !== id), next]), 'A matching question already exists.', 409);
    const mutation = crypto.randomUUID();
    const header = db.prepare(`UPDATE decks SET revision = revision + 1, mutation = ?, updated_at = ?
      WHERE id = ? AND ${editAccess(4)} AND revision = ? ${thirdParty ? "AND third_party_access = 'READ_WRITE'" : ""}`).bind(mutation, now, deckId, user, deck.revision);
    const receipt = idempotency ? [db.prepare(`INSERT INTO mcp_card_idempotency(principal, operation, key, payload, card_id, created_at)
      SELECT ?, 'create_card', ?, ?, ?, ? WHERE EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
      .bind(user, idempotency.key, idempotency.payload, id, now, deckId, mutation)] : [];
    const replaceTopics = !current || input.metadata !== undefined;
    const [result] = await db.batch([header, ...(thirdParty ? writeCanonicalCards(db, deckId, mutation, now, [{ ...next, ...next.canonical!, topics: !current || Object.hasOwn(input, 'topics') ? next.canonical!.topics : undefined }]) : writeCards(db, deckId, mutation, now, [next], false, replaceTopics)), ...receipt]);
    check(result.meta.changes, 'Deck changed. Reload it and try again.', 409);
    return { id, revision: deck.revision + 1, ...(thirdParty ? { classification: { metadata: next.canonical!.metadata, topics: next.canonical!.topics, priority: next.canonical!.priority, likelihood: next.canonical!.likelihood, creationMode: next.canonical!.creation_mode } } : {}), ...(method === 'answer' ? { answer: translations[String(input.language ?? current!.primary_language)].answer } : {}) };
  }
  const mutation = crypto.randomUUID();
  const header = db.prepare(`UPDATE decks SET revision = revision + 1, mutation = ?, updated_at = ? WHERE id = ?
    AND ${editAccess(4)} AND revision = ? ${thirdParty ? "AND third_party_access = 'READ_WRITE'" : ""}`).bind(mutation, now, deckId, user, deck.revision);
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
  check(parsed.version === 5, 'Standard import requires formatVersion: 5. Convert legacy v3/v4 Markdown to v5, review the conversion, then preview and explicitly import it.');
  check(parsed.cards.length > 0 && parsed.cards.length <= 1000, 'Include between 1 and 1000 Markdown questions.');
  const { metadata } = parsed;
  const key = metadata.deckId ? string(metadata.deckId, 'Markdown deckId', 160) : null;
  const deck = input.target === 'new' ? null : input.target
    ? await getDeck(db, user, string(input.target, 'target deck', 80), true)
    : key ? await db.prepare('SELECT * FROM decks WHERE owner_id = ? AND source_key = ?').bind(user, key).first<Deck>() : null;
  if (deck) Object.assign(deck, decodeDeck(deck));
  const existing = deck ? await listCards(db, user, deck.id) : [];
  const links = object(input.links ?? {});
  if (input.replace === true) {
    check(deck && deck.owner_id === user, 'Only the owner may replace cards.', 403);
  }
  return { deck, key, metadata, existing, parsed, links };
}

function importLanguageConfig(deck: Deck | null, metadata: Record<string, string>, input: Record<string, unknown>, cards: ImportTarget[]) {
  if (deck) return { primaryLanguage: deck.primaryLanguage, supportedLanguages: deck.supportedLanguages };
  const languages = [...new Set(cards.flatMap(card => Object.keys(card.translations)))].sort();
  return deckLanguages({
    primaryLanguage: input.primaryLanguage ?? metadata.primaryLanguage ?? (languages.length === 1 ? languages[0] : null),
    supportedLanguages: input.supportedLanguages ?? (metadata.supportedLanguages ? JSON.parse(metadata.supportedLanguages) : languages),
  });
}

export async function inspectImport(db: D1Database, user: string, input: Record<string, unknown>) {
  const { deck, key, metadata, existing, parsed, links } = await prepareImport(db, user, input);
  const { rows, cards } = planImport(parsed, input.replace === true ? [] : existing, links, object(input.choices ?? {}));
  try {
    const inferred = [...new Set(cards.flatMap(card => Object.keys(card.translations)))];
    // A new multilingual deck without a declared primary is resolved in the UI.
    if (deck || input.primaryLanguage !== undefined || metadata.primaryLanguage || inferred.length === 1) {
      const config = importLanguageConfig(deck, metadata, input, cards);
      for (const card of cards) validateCardLanguages({ ...card, metadata: card.canonical?.metadata ?? card.metadata }, config);
    }
    check(uniqueQuestions(cards), 'A matching question already exists.', 409);
  } catch (error) {
    rows.push({ index: 'deck-validation', kind: 'invalid', question: '', message: error instanceof Error ? error.message : 'Invalid final deck' });
  }
  const impact = deck ? await replacementImpact(db, deck.id) : null;
  return { impact, deck, key, metadata, rows, existing: existing.length, version: parsed.version };
}

export interface CanonicalWriteTarget {
  id: string;
  metadata: CanonicalCardMetadata;
  import_key: string | null;
  primary_language: import('../lib/translations').Language;
  translations: Translations;
  interview_priority: number | null;
  difficulty: number | null;
  priority: Rating;
  likelihood: Rating;
  creation_mode: CreationMode;
  /** Undefined preserves memberships without issuing membership SQL. */
  topics?: string[];
}

export function writeCanonicalCards(
  db: D1Database, deck: string, mutation: string, now: number,
  cards: CanonicalWriteTarget[], insertOnly = false, updateClassification = true,
) {
  const values = cards.map((card, position) => {
    const metadata = validateCanonicalMetadata(metadataForStorage(card.metadata));
    const translations = structuredClone(card.translations);
    validateFinalTranslations(translations, metadata.cardType);
    const content = card.translations[card.primary_language]!;
    return {
      ...card, metadata: metadataForStorage(metadata), translations,
      priority: validateRating(card.priority, 'priority'),
      likelihood: validateRating(card.likelihood, 'likelihood'),
      creation_mode: validateCreationMode(card.creation_mode, 'creationMode'),
      ...(card.topics === undefined ? {} : { topics: normalizeTopics(card.topics) }),
      position, questionKey: questionKey(content.question),
    };
  });
  const encoded = JSON.stringify(values);
  const targetGuard = db.prepare(`INSERT INTO card_topics(card_id, topic_name)
    SELECT c.id, NULL FROM cards c JOIN json_each(?) input ON input.value ->> 'id' = c.id
    WHERE c.deck_id <> ? AND EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
    .bind(encoded, deck, deck, mutation);
  const write = db.prepare(`INSERT INTO cards (id, deck_id, stable_key, question_key, position,
    created_at, updated_at, import_key, primary_language, translations, interview_priority, difficulty, metadata,
    priority, likelihood, creation_mode)
    SELECT value ->> 'id', ?, value ->> 'id', value ->> 'questionKey',
      (SELECT coalesce(max(position), -1) + 1 FROM cards WHERE deck_id = ?) + (value ->> 'position'),
      ?, ?, value ->> 'import_key', value ->> 'primary_language', value -> 'translations',
      value ->> 'interview_priority', value ->> 'difficulty', value -> 'metadata',
      value ->> 'priority', value ->> 'likelihood', value ->> 'creation_mode'
    FROM json_each(?) WHERE EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)
    ${insertOnly ? '' : `ON CONFLICT(id) DO UPDATE SET question_key = excluded.question_key, updated_at = excluded.updated_at, import_key = excluded.import_key,
      primary_language = excluded.primary_language, translations = excluded.translations,
      interview_priority = excluded.interview_priority, difficulty = excluded.difficulty, metadata = excluded.metadata
      ${updateClassification ? ', priority = excluded.priority, likelihood = excluded.likelihood, creation_mode = excluded.creation_mode' : ''}
      WHERE cards.deck_id = excluded.deck_id`}`)
    .bind(deck, deck, now, now, encoded, deck, mutation);
  const supplied = values.some(card => card.topics !== undefined);
  if (!supplied) return [targetGuard, write];
  const remove = db.prepare(`DELETE FROM card_topics
    WHERE card_id IN (SELECT c.id FROM cards c JOIN json_each(?) input ON input.value ->> 'id' = c.id
      WHERE c.deck_id = ? AND json_type(input.value, '$.topics') = 'array')
    AND EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
    .bind(encoded, deck, deck, mutation);
  const insert = db.prepare(`INSERT INTO card_topics(card_id, topic_name)
    SELECT card.value ->> 'id', topic.value
    FROM json_each(?) card
    JOIN cards c ON c.id = card.value ->> 'id' AND c.deck_id = ?
    JOIN json_each(card.value, '$.topics') topic
    WHERE json_type(card.value, '$.topics') = 'array'
      AND EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
    .bind(encoded, deck, deck, mutation);
  return [targetGuard, write, remove, insert];
}

/** Temporary v3/v4-to-canonical storage adapter; parsing semantics remain unchanged. */
export function writeCards(
  db: D1Database, deck: string, mutation: string, now: number,
  cards: ImportTarget[], insertOnly = false, replaceTopics = true,
) {
  const canonical = cards.map(card => {
    const { legacyMetadataProvided, ...target } = card;
    const legacy = card.metadata;
    const stored = card.canonical;
    const metadata = legacy ? {
      cardType: legacy.cardType === 'coding_task' ? 'task' as const : 'question' as const,
      provenance: legacy.provenance,
      ...(legacy.answerReferences === undefined ? {} : { answerReferences: legacy.answerReferences }),
      occurrenceCount: legacy.occurrenceCount,
    } : stored?.metadata ?? { cardType: 'question' as const, occurrenceCount: 0 };
    return {
      ...target, metadata, priority: stored?.priority ?? DEFAULT_RATING, likelihood: stored?.likelihood ?? DEFAULT_RATING,
      creation_mode: stored?.creation_mode ?? DEFAULT_CREATION_MODE,
      ...(replaceTopics && legacyMetadataProvided !== false ? { topics: legacy ? normalizeTopics([legacy.topic]) : [] } : {}),
    } satisfies CanonicalWriteTarget;
  });
  return writeCanonicalCards(db, deck, mutation, now, canonical, insertOnly, false);
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
    check(row.kind !== 'invalid', row.message ?? 'Invalid v5 card.');
    check(row.kind !== 'link', 'Resolve how each card matches the existing deck.');
    if (row.kind === 'conflict') check(['keep', 'update'].includes(String(updates[row.index])), 'Resolve every content conflict.');
  }
  const languageConfig = importLanguageConfig(deck, metadata, input, cards);
  for (const card of cards) validateCardLanguages({ ...card, metadata: card.canonical?.metadata ?? card.metadata }, languageConfig);
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
  batch.push(...writeCanonicalCards(db, id, mutation, now, changed.map(card => ({
    ...card, metadata: card.canonical!.metadata, topics: card.topicsProvided ? card.canonical!.topics : undefined,
    priority: card.canonical!.priority, likelihood: card.canonical!.likelihood,
    creation_mode: card.canonical!.creation_mode,
  }))));
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
    return db.prepare(`UPDATE cards SET primary_language = ?, question_key = ?
      WHERE id = ? AND deck_id = ? AND EXISTS (SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
      .bind(language, questionKey(content.question), card.id, id, id, mutation);
  }) : [];
}
